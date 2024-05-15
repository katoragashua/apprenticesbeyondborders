const modal = document.getElementById("modal");
modal.style.display = "none";

const updateRemainingTime = (countDownDate) => {
  let distance = countDownDate.getTime() - new Date().getTime();

  let day = Math.floor(distance / (1000 * 60 * 60 * 24));
  let hour = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  let minute = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  let second = Math.floor((distance % (1000 * 60)) / 1000);

  document.querySelector("#day span").textContent = day === 1 ? "day" : "days";
  document.querySelector("#hour span").textContent =
    hour === 1 ? "hour" : "hours";
  document.querySelector("#mins span").textContent =
    minute === 1 ? "minute" : "minutes";
  document.querySelector("#sec span").textContent =
    second === 1 ? "second" : "seconds";

  document.querySelector("#day h3").textContent = day;
  document.querySelector("#hour h3").textContent = hour;
  document.querySelector("#mins h3").textContent = minute;
  document.querySelector("#sec h3").textContent = second;
};

setTimeout(function count() {
  updateRemainingTime(new Date("Jun 30, 2024"));
  setTimeout(count, 1000);
}, 1000);

const form = document.getElementById("form");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const userData = Object.fromEntries(formData);
  console.log(userData);
  try {
    const res = await fetch("https://www.apprenticesbeyondborders.com/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    const user = await res.json();
    console.log(user);
    // alert(user.msg)

    modal.style.display = "block";
    modal.style.backgroundColor = "#cad5cfa5";
    modal.style.color = user.user? "green" : "red";
    modal.textContent = user.msg;
    form.reset();
    setTimeout(function () {
      modal.style.display = "none";
    }, 3000);
    
    return user;
  } catch (error) {
    console.log(error);
  }
});
