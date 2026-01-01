/**
 * `frontend/app/(public)/login/LoginForm.tsx`, componente formulário para `/login`
 * 
 *  Formulário de login
 * 
 * 
 * Notar que:
 *  1.  Os termos e serviços, bem como a política de privacidade, não foram definidos ainda neste estágio do projeto;
 *      portanto os links na parte inferior do formulário são rotas falsas.
 *  2.  Os mecanismos para 'lembrar-me' e 'esqueci minha senha' ainda não foram implementados.
 */

"use client";

//  hook para estado, react
import { useState } from "react";

//  hook para autenticação
import { useLogin } from "./useLogin";

/**
 * Formulário de login.
 * 
 * Formulário de login, com campos para usuário e senha, e um botão para submeter o formulário.
 * 
 * Se o formulário estiver carregando, mostra uma mensagem de "Carregando...".
 * 
 * @returns {JSX.Element} - Elemento JSX com o formulário de login.
 */
export function LoginForm() {
    const { submit, error, loading } = useLogin();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                submit(username, password);
            }}
            className="space-y-6"
        >
            {/* Campo de Usuário */}
            <div className="space-y-2">
                <label 
                    htmlFor="username" 
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                    Usuário ou E-mail
                </label>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg 
                            className="h-5 w-5 text-gray-400" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                            />
                        </svg>
                    </div>
                    <input
                        id="username"
                        type="text"
                        placeholder="seu.usuario@email.com"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                    />
                </div>
            </div>

            {/* Campo de Senha */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label 
                        htmlFor="password" 
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                        Senha
                    </label>
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                    >
                        {showPassword ? "Ocultar" : "Mostrar"}
                    </button>
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg 
                            className="h-5 w-5 text-gray-400" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
                            />
                        </svg>
                    </div>
                    <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-indigo-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        required
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {showPassword ? (
                            <svg 
                                className="h-5 w-5 text-gray-400 cursor-pointer" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" 
                                />
                            </svg>
                        ) : (
                            <svg 
                                className="h-5 w-5 text-gray-400 cursor-pointer" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" 
                                />
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" 
                                />
                            </svg>
                        )}
                    </div>
                </div>
            </div>

            {/* Lembrar-me e Esqueci a senha:
                ainda não implementados */}
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label 
                        htmlFor="remember-me" 
                        className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                    >
                        Lembrar-me
                    </label>
                </div>
                <a 
                    href="/esqueci-senha" 
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors"
                >
                    Esqueceu a senha?
                </a>
            </div>

            {/* Botão de Submit */}
            <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:-translate-y-0.5"
            >
                {loading ? (
                    <>
                        <svg 
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                        >
                            <circle 
                                className="opacity-25" 
                                cx="12" 
                                cy="12" 
                                r="10" 
                                stroke="currentColor" 
                                strokeWidth="4"
                            />
                            <path 
                                className="opacity-75" 
                                fill="currentColor" 
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Entrando...
                    </>
                ) : (
                    "Entrar na conta"
                )}
            </button>

            {/* Mensagem de Erro */}
            {error && (
                <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0">
                            <svg 
                                className="h-5 w-5 text-red-400" 
                                viewBox="0 0 20 20" 
                                fill="currentColor"
                            >
                                <path 
                                    fillRule="evenodd" 
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                                    clipRule="evenodd" 
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                Erro ao entrar
                            </h3>
                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                                {error}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Link para termos (ainda não implementado) */}
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-8">
                Ao entrar, você concorda com nossos{" "}
                <a 
                    href="/termos" 
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    Termos de Serviço
                </a>{" "}
                e{" "}
                <a 
                    href="/privacidade" 
                    className="text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                    Política de Privacidade
                </a>
                .
            </p>
        </form>
    );
}