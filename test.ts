import fetch from "node-fetch";

(async () => {
  try {
    const res = await fetch("http://0.0.0.0:3000/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feature: "tag-generator", payload: { title: "Hand painted blue pottery bowl", category: "blue_pottery" } })
    });
    const data = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", data);
  } catch(err) {
    console.error(err);
  }
})();
