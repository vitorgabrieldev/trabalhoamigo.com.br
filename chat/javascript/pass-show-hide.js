const pswrdField = document.querySelector(".form input[type='senha']"),
toggleIcon = document.querySelector(".form .field i");

toggleIcon.onclick = () =>{
  if(pswrdField.type === "senha"){
    pswrdField.type = "text";
    toggleIcon.classList.add("active");
  }else{
    pswrdField.type = "senha";
    toggleIcon.classList.remove("active");
  }
}
