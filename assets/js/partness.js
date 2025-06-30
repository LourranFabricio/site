document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cadastroForm");
  const lista = document.getElementById("listaUsuarios");

  function carregarUsuarios() {
    fetch("backend/listar.php")
      .then(res => res.json())
      .then(usuarios => {
        lista.innerHTML = "";
        usuarios.forEach(usuario => {
          const li = document.createElement("li");
          li.innerHTML = `
            ${usuario.nome} (${usuario.email})
            <button onclick="excluirUsuario(${usuario.id})">Excluir</button>
          `;
          lista.appendChild(li);
        });
      });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    fetch("backend/cadastrar.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha })
    })
    .then(res => res.text())
    .then(msg => {
      alert(msg);
      form.reset();
      carregarUsuarios();
    });
  });

  window.excluirUsuario = function(id) {
    if (confirm("Tem certeza que deseja excluir este usuário?")) {
      fetch(`backend/excluir.php?id=${id}`, { method: "GET" })
        .then(res => res.text())
        .then(msg => {
          alert(msg);
          carregarUsuarios();
        });
    }
  }

  carregarUsuarios();
});
