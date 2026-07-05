// Citation: https://www.youtube.com/watch?v=Y-XW9m8qOis

import React, {useState} from "react";
import '../styles/LoginPage.css';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [pass, setPass] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(email);
    }

    return (
        <div className="auth-form-container">
            <form className="login-form" onSubmit={handleSubmit}>
            <label for="email">email</label>
            <input value={email} type = "email" placeholder="youremail@beaver.com" id="email" name="email"></input>
            <label for="password">password</label>
            <input value={pass} type = "password" placeholder="********" id="password" name="password"></input>
            <button type="submit">Login</button>
            </form>
        </div>
    );

};