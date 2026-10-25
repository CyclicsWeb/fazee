<<<<<<< Updated upstream

import Login from "./secciones/login/login";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Login></Login>
    </main>
  );
=======
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/auth/login");
>>>>>>> Stashed changes
}
