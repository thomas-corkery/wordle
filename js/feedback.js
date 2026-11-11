/* ============ FEEDBACK FORM ============ */
const fb = document.getElementById("fb");
const fbForm = document.getElementById("fb-form");
const fbStatus = document.getElementById("fb-status");

document.getElementById("fb-open").onclick = () => { fbStatus.textContent = ""; fb.showModal(); };
document.getElementById("fb-cancel").onclick = () => fb.close();

fbForm.onsubmit = async e => {
  e.preventDefault();
  fbStatus.textContent = "Sending…";
  try {
    const data = new FormData(fbForm);
    data.append("game_no", dayNum + 1); // which day's puzzle they were on
    const res = await fetch(CONFIG.feedbackUrl, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" }
    });
    if (!res.ok) throw new Error();
    fbForm.reset(); fb.close(); msg.textContent = "Thanks for the feedback!";
  } catch (err) {
    fbStatus.textContent = "Couldn’t send. Please try again.";
  }
};
