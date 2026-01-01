/**
 *  `frontend/app/(public)/login/page.tsx`, componente `/login`
 * 
 *  Página de login com seção de boas-vindas aprimorada.
 */

import { LoginForm } from "./LoginForm";

/**
 * Página de login.
 * 
 * Exibe um formulário para realizar o login com base nos dados informados.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Lado esquerdo - Boas-vindas e instruções */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md">
          {/* Cabeçalho */}
          <div className="mb-10">
            <div className="inline-flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h1 className="text-4xl font-italic">Sala de Leitura</h1>
                <p className="text-indigo-100 mt-2">Sistema de Gestão</p>
              </div>
            </div>
          </div>

          {/* Instruções em destaque */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-white/20">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-2xl">📋</span> Instruções
            </h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">1</span>
                <span>Este é um sistema em desenvolvimento para gerenciamento de uma sala de leitura. Nem todas as funcionalidades estão perfeitamente alinhadas ainda!</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">2</span>
                <span>Use as credenciais fornecidas para acessar e visualizar um pouco do nosso sistema</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="bg-white/20 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0">3</span>
                <span>Qualquer dúvida, por favor entre em contato!</span>
              </li>
            </ul>
          </div>

          {/* Dicas úteis */}
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🔐</span>
              </div>
              <div>
                <h3 className="font-semibold">Problemas de acesso?</h3>
                <p className="text-sm text-indigo-100/80 mt-1">
                  Use a opção "Esqueci minha senha" ou entre em contato com nosso suporte.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🆕</span>
              </div>
              <div>
                <h3 className="font-semibold">É novo por aqui?</h3>
                <p className="text-sm text-indigo-100/80 mt-1">
                  <a 
                    href="/cadastro" 
                    className="underline hover:text-white transition-colors"
                  >
                    Crie uma conta gratuitamente
                  </a> em menos de 2 minutos.
                </p>
              </div>
            </div>
          </div>

          {/* Estatísticas ou informações da plataforma */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">0+</div>
                <div className="text-sm text-indigo-100/80">Usuários ativos</div>
              </div>
              <div>
                <div className="text-2xl font-bold">75% ?</div>
                <div className="text-sm text-indigo-100/80">Disponibilidade</div>
              </div>
              <div>
                <div className="text-2xl font-bold">conforme o possível</div>
                <div className="text-sm text-indigo-100/80">Suporte</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="w-full max-w-md">
          {/* Header para mobile com boas-vindas */}
          <div className="md:hidden mb-8 text-center">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">👋</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Bem-vindo
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Acesse sua conta
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Entre para continuar de onde parou
            </p>
          </div>

          {/* Card do formulário */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-10 border border-gray-100 dark:border-gray-700">
            {/* Instrução rápida para desktop */}
            <div className="hidden md:block mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
              <p className="text-sm text-indigo-700 dark:text-indigo-300">
                💡 <strong>Dica:</strong> Use as mesmas credenciais do seu e-mail corporativo
              </p>
            </div>

            <LoginForm />

            {/* Restante do código permanece igual... */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Ou continue com
                </span>
              </div>
            </div>

            {/* Social login buttons */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <button className="flex items-center justify-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {/* Ícone Google */}
                <span className="text-gray-700 dark:text-gray-300">Google</span>
              </button>
              <button className="flex items-center justify-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {/* Ícone GitHub */}
                <span className="text-gray-700 dark:text-gray-300">GitHub</span>
              </button>
            </div>

            {/* Link para cadastro */}
            <div className="text-center pt-6 border-t border-gray-100 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400">
                Não tem uma conta?{" "}
                <a 
                  href="/cadastro" 
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                >
                  Cadastre-se gratuitamente
                </a>
              </p>
            </div>
          </div>

          {/* Rodapé */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Precisa de ajuda?{" "}
              <a 
                href="/suporte" 
                className="text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Fale com nosso suporte
              </a>
            </p>
            <div className="mt-2">
              <a 
                href="/termos" 
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Termos de Uso
              </a>
              <span className="mx-2">•</span>
              <a 
                href="/privacidade" 
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Privacidade
              </a>
              <span className="mx-2">•</span>
              <a 
                href="/seguranca" 
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                Segurança
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}