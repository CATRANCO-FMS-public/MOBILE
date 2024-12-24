import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Add Pusher to the global scope for Echo
global.Pusher = Pusher;

// Initialize Echo
const echo = new Echo({
  broadcaster: "pusher",
  key: "fd227cd5f0071dee1076", 
  cluster: "ap1",
  encrypted: true,
  forceTLS: true, 
});

export default echo;
