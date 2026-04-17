const swiper = new Swiper('.swiper', {
    loop: true, // Faz o slider voltar ao início
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    autoplay: {
      delay: 3000, // Tempo entre slides (ms)
    },
  });