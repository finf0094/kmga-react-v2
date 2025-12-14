import React, { useState } from "react";
import { useAppDispatch } from "@store";
import { register } from "@store/slices";
import './RegisterPage.css';
import { useNavigate, Link } from "react-router-dom";

const RegisterPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordRepeat, setPasswordRepeat] = useState('');
    const [error, setError] = useState('');

    const handleGoogleAuth = async () => {
        window.open(`${import.meta.env.VITE_API_URL}/api/auth/google`, `_self`);
    };

    const handleYandexAuth = async () => {
        window.open(`${import.meta.env.VITE_API_URL}/api/auth/yandex`, `_self`);
    }

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email || !password || !passwordRepeat) {
            setError('Заполните все поля!');
            return;
        }

        if (password.length < 6) {
            setError('Пароль должен содержать минимум 6 символов');
            return;
        }

        if (password !== passwordRepeat) {
            setError('Пароли не совпадают');
            return;
        }

        try {
            const data: any = await dispatch(register({ email, password, passwordRepeat }));

            if ('message' in data.payload) {
                setError(data.payload?.message);
            } else {
                navigate('/login');
            }
        } catch (error) {
            console.error(error);
            setError(`Ошибка при регистрации: ${error}`);
        }
    };

    return (
        <div className="register">
            <div className="register__inner">
                <div className="register__head">
                    <h2 className="register__title">Register</h2>
                    <p className="register__desc">Create your account</p>
                </div>
                <form onSubmit={handleRegister} className="register__form">
                    <div className="register__field">
                        <label htmlFor="email" className="register__label">Email</label>
                        <input
                            className="register__input"
                            id="email"
                            placeholder="Enter your Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="register__field">
                        <label htmlFor="password" className="register__label">Password</label>
                        <input
                            className="register__input"
                            id="password"
                            placeholder="Enter your password (min 6 characters)"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="register__field">
                        <label htmlFor="passwordRepeat" className="register__label">Repeat Password</label>
                        <input
                            className="register__input"
                            id="passwordRepeat"
                            placeholder="Repeat your password"
                            type="password"
                            value={passwordRepeat}
                            onChange={(e) => setPasswordRepeat(e.target.value)}
                        />
                    </div>
                    <span className="error-message">{error}</span>
                    <button type="submit" className="register__button">Register</button>
                </form>
                <div className="register__login-link">
                    <span>Уже есть аккаунт? </span>
                    <Link to="/login">Войти</Link>
                </div>
                <div className="register__oauth">
                    <button type="button" className="register__button-oauth" onClick={handleGoogleAuth}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                            <path fill="#FFC107"
                                d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917"></path>
                            <path fill="#FF3D00"
                                d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691"></path>
                            <path fill="#4CAF50"
                                d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44"></path>
                            <path fill="#1976D2"
                                d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917"></path>
                        </svg>
                        Google
                    </button>
                    <button type="button" className="register__button-oauth" onClick={handleYandexAuth}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 1000 1000">
                            <path fill="#626469"
                                d="M177.188 0C79.032 0 0 79.032 0 177.188v645.625c0 98.156 79.032 177.188 177.188 177.188h475.188l347.625-499.875L652.376.001zm266.094 182.563h112.906c6.932 0 10.906 2.535 10.906 8.5v622.25c0 4.234-1.995 6.781-7.938 6.781H497.75c-3.934 0-6.906-3.396-6.906-5.938V583.781h-49.563L303.625 814.156c-1.976 4.239-5.932 5.938-11.875 5.938h-70.313c-7.9 0-12.854-5.937-7.906-13.594l151.5-234.625c-81.187-30.602-126.75-92.656-126.75-176.813c0-140.264 94.091-212.5 205-212.5zm-2.969 54.375c-60.412 0-119.844 43.352-119.844 149.625c0 102.011 63.389 142.813 128.75 142.813h41.625V236.938z"></path>
                        </svg>
                        Yandex
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
