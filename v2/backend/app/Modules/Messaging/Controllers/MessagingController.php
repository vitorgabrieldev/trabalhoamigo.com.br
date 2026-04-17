<?php

namespace App\Modules\Messaging\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
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
                'proposal:id,uuid,status',
                'contractor:id,uuid,first_name,last_name,avatar_url',
                'provider:id,uuid,first_name,last_name,avatar_url',
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
            'other_party' => $user->id === $c->contractor_id
                ? ['uuid' => $c->provider->uuid, 'name' => $c->provider->full_name, 'avatar_url' => $c->provider->avatar_url]
                : ['uuid' => $c->contractor->uuid, 'name' => $c->contractor->full_name, 'avatar_url' => $c->contractor->avatar_url],
            'unread_count' => $c->unread_count,
            'last_message_at' => $c->last_message_at?->toIso8601String(),
        ]));
    }

    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeConversation($request->user(), $conversation);

        // Mark messages as read
        $conversation->messages()
            ->where('sender_id', '!=', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = $conversation->messages()
            ->with('sender:id,uuid,first_name,last_name,avatar_url')
            ->latest()
            ->paginate(50);

        return response()->json($messages->through(fn ($m) => [
            'uuid' => $m->uuid,
            'body' => $m->body,
            'read_at' => $m->read_at?->toIso8601String(),
            'sender' => [
                'uuid' => $m->sender->uuid,
                'name' => $m->sender->full_name,
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
            'body' => ['required', 'string', 'max:2000'],
        ]);

        $message = Message::create([
            'uuid' => Str::uuid(),
            'conversation_id' => $conversation->id,
            'sender_id' => $request->user()->id,
            'body' => $request->body,
        ]);

        $conversation->update(['last_message_at' => now()]);

        return response()->json([
            'uuid' => $message->uuid,
            'body' => $message->body,
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
