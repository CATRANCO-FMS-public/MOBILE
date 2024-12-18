import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Add Pusher to the global scope for Echo
global.Pusher = Pusher;

// Initialize Echo
const echo = new Echo({
  broadcaster: "pusher",
  key: "97e12b5f39c1e3b65007", 
  cluster: "ap1",
  encrypted: true,
  forceTLS: true, 
});

export default echo;
