<?php 
  session_start();
  if(isset($_SESSION['unique_id'])){
    header("location: users.php");
  }
?>

<?php include_once "header.php"; ?>
<body>
  <div class="wrapper">
    <section class="form signup">
      <h3 class="title-redirect">Crie rapidamente sua conta</h3>
      <form action="#" method="POST" enctype="multipart/form-data" autocomplete="off">
        <div class="field button">
          <button onclick="location.href = '../src/views/contratante/CriarConta/'" class="button-redirect" type="button">Continuar em TrabalhoAmigo</button>
        </div>
      </form>
      <div class="link">Já possuo conta? <a href="login.php">Acessar</a></div>
    </section>
  </div>

  <script src="javascript/pass-show-hide.js"></script>
  <script src="javascript/signup.js"></script>

</body>
</html>
