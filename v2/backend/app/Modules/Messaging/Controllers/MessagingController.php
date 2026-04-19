<?php

namespace App\Modules\Messaging\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class MessagingController extends Controller
{
    public function conversations(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = Conversation::where(function ($q) use ($user) {
            $q->where('contractor_id', $user->id)
                ->orWhere('provider_id', $user->id);
        })
            ->with([
                'proposal:id,uuid,status,service_id',
                'proposal.service:id,uuid,title',
                'contractor:id,uuid,first_name,last_name,avatar_url',
                'provider:id,uuid,first_name,last_name,avatar_url',
                'messages' => fn ($q) => $q->latest()->limit(1),
            ])
            ->withCount(['messages as unread_count' => fn ($q) => $q
                ->where('sender_id', '!=', $user->id)
                ->whereNull('read_at')
            ])
            ->latest('last_message_at')
            ->paginate(20);

        return response()->json($conversations->through(fn ($c) => [
            'uuid' => $c->uuid,
            'proposal_uuid' => $c->proposal?->uuid,
            'proposal_status' => $c->proposal?->status,
            'service_title' => $c->proposal?->service?->title,
            'service_uuid' => $c->proposal?->service?->uuid,
            'other_party' => $user->id === $c->contractor_id
                ? [
                    'uuid' => $c->provider->uuid,
                    'first_name' => $c->provider->first_name,
                    'last_name' => $c->provider->last_name,
                    'avatar_url' => $c->provider->avatar_url,
                ]
                : [
                    'uuid' => $c->contractor->uuid,
                    'first_name' => $c->contractor->first_name,
                    'last_name' => $c->contractor->last_name,
                    'avatar_url' => $c->contractor->avatar_url,
                ],
            'unread_count' => $c->unread_count,
            'last_message_at' => $c->last_message_at?->toIso8601String(),
            'last_message' => $c->messages->first()
                ? [
                    'body' => $c->messages->first()->body,
                    'media' => $c->messages->first()->media,
                ]
                : null,
        ]));
    }

    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request->user(), $conversation);

        $conversation->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = $conversation->messages()
            ->with('sender:id,uuid,first_name,last_name,avatar_url')
            ->oldest()
            ->paginate(50);

        return response()->json($messages->through(fn ($m) => [
            'uuid' => $m->uuid,
            'body' => $m->body,
            'media' => $m->media,
            'read_at' => $m->read_at?->toIso8601String(),
            'sender' => [
                'uuid' => $m->sender->uuid,
                'first_name' => $m->sender->first_name,
                'last_name' => $m->sender->last_name,
                'avatar_url' => $m->sender->avatar_url,
                'is_me' => $m->sender_id === $request->user()->id,
            ],
            'created_at' => $m->created_at->toIso8601String(),
        ]));
    }

    public function send(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request->user(), $conversation);

        $request->validate([
            'body' => ['nullable', 'string', 'max:2000'],
            'files' => ['nullable', 'array', 'max:5'],
            'files.*' => [
                'file',
                'mimes:jpg,jpeg,png,gif,webp,mp4,mov,avi,pdf,doc,docx,xls,xlsx,zip',
                'max:20480',
            ],
        ]);

        $media = null;

        if ($request->hasFile('files')) {
            $media = [];
            foreach ($request->file('files') as $file) {
                $path = $file->store('messages', 'public');
                $mime = $file->getMimeType() ?? '';
                $media[] = [
                    'url' => Storage::disk('public')->url($path),
                    'type' => str_starts_with($mime, 'image/') ? 'image'
                        : (str_starts_with($mime, 'video/') ? 'video' : 'document'),
                    'name' => $file->getClientOriginalName(),
                ];
            }
        }

        if (! $request->body && ! $media) {
            return response()->json(['message' => 'Mensagem ou arquivo é obrigatório.'], 422);
        }

        $message = Message::create([
            'uuid' => Str::uuid(),
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'body' => $request->input('body') ?? null,
            'media' => $media,
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json([
            'uuid' => $message->uuid,
            'body' => $message->body,
            'media' => $message->media,
            'sender' => [
                'uuid' => $request->user()->uuid,
                'first_name' => $request->user()->first_name,
                'last_name' => $request->user()->last_name,
                'avatar_url' => $request->user()->avatar_url,
                'is_me' => true,
            ],
            'created_at' => $message->created_at->toIso8601String(),
        ], 201);
    }

    private function authorizeConversation(mixed $user, Conversation $conversation): void
    {
        if (! in_array($user->id, [$conversation->contractor_id, $conversation->provider_id])) {
            abort(403, 'Não autorizado.');
        }
    }
}
