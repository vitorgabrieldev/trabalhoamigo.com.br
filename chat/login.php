<?php 
  session_start();

  echo $_SESSION['unique_id'];

  if(isset($_SESSION['unique_id'])){
    header("location: users.php");
  }

?>

<?php include_once "header.php"; ?>
<body>
  <div class="wrapper">
    <section class="form login">
      <header>Bate Papo | Trabalho amigo</header>
      <form action="#" method="POST" enctype="multipart/form-data" autocomplete="off">
        <div class="error-text"></div>
        <div class="field input">
          <label>Endereço de E-mail</label>
          <input type="text" name="email" placeholder="Digite seu e-mail" required>
        </div>
        <div class="field input">
          <label>Senha</label>
          <input type="password" name="password" placeholder="Digite sua senha" required>
          <i class="fas fa-eye"></i>
        </div>
        <div class="field button">
          <input type="submit" name="submit" value="Continuar para o bate-papo">
        </div>
      </form>
      <div class="link">Não possuo conta? <a href="index.php">Criar nova conta</a></div>
    </section>
  </div>
  
  <script src="javascript/pass-show-hide.js"></script>
  <script src="javascript/login.js"></script>

</body>
</html>
