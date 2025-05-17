function changeBackground() {
  const colors = ["#f0f0f0", "#c3f0ca", "#f9c0c0", "#c0ddf9"];
  document.body.style.backgroundColor =
    colors[Math.floor(Math.random() * colors.length)];
}
