auth.onAuthStateChanged(user => {
  if (!user) {
    if (!window.location.pathname.includes("login"))
      window.location.href = "login.html";
  } else {
    if (document.getElementById("userName"))
      document.getElementById("userName").innerText = "👤 " + user.displayName;

    if (document.getElementById("profileName"))
      document.getElementById("profileName").innerText = user.displayName;

    loadMusics();
    loadProfileMusics();
  }
});

function login() {
  const provider = new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(() => window.location.href = "index.html");
}

function logout() {
  auth.signOut();
}

function goProfile() {
  window.location.href = "profile.html";
}

function goHome() {
  window.location.href = "index.html";
}

function postMusic() {
  const user = auth.currentUser;

  db.collection("musics").add({
    name: musicName.value,
    url: musicURL.value,
    cover: coverURL.value,
    user: user.displayName,
    userId: user.uid,
    likes: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
}

function likeMusic(id, likes) {
  db.collection("musics").doc(id).update({
    likes: likes + 1
  });
}

function loadMusics() {
  if (!document.getElementById("musicList")) return;

  db.collection("musics").orderBy("createdAt", "desc")
    .onSnapshot(snapshot => {

      let list = [];
      musicList.innerHTML = "";
      ranking.innerHTML = "";

      snapshot.forEach(doc => {
        const music = doc.data();
        list.push({ id: doc.id, ...music });

        musicList.innerHTML += `
          <div class="card">
            <img src="${music.cover}" width="100%">
            <h3>${music.name}</h3>
            <p>${music.user}</p>
            <audio controls src="${music.url}"></audio>
            <button onclick="likeMusic('${doc.id}', ${music.likes})">
              ❤️ ${music.likes}
            </button>
          </div>
        `;
      });

      list.sort((a,b) => b.likes - a.likes)
          .slice(0,3)
          .forEach(m => {
            ranking.innerHTML += `<p>🔥 ${m.name} (${m.likes})</p>`;
          });
    });
}

function loadProfileMusics() {
  if (!document.getElementById("myMusics")) return;

  const user = auth.currentUser;

  db.collection("musics")
    .where("userId", "==", user.uid)
    .onSnapshot(snapshot => {
      myMusics.innerHTML = "";
      snapshot.forEach(doc => {
        const music = doc.data();
        myMusics.innerHTML += `
          <div class="card">
            <h3>${music.name}</h3>
            <audio controls src="${music.url}"></audio>
          </div>
        `;
      });
    });
}