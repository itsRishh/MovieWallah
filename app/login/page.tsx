"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {

    const { data, error } = await authClient.signIn.email({
      /**
       * The user email
       */
      email,
      /**
       * The user password
       */
      password,
      /**
       * A URL to redirect to after the user verifies their email (optional)
       */
      callbackURL: "/dashboard",
      /**
       * remember the user session after the browser is closed. 
       * @default true
       */
      rememberMe: false
    }, {
      //callbacks
    })
  };



  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <input className="border-1 border-white rounded-md p-2" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input className="border-1 border-white rounded-md p-2" type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
    </div>
  );
}