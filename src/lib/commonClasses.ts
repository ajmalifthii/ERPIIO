export const commonClasses = {
  input: `w-full px-4 py-2 rounded-lg border-transparent
          bg-slate-200/50 dark:bg-slate-800/50
          text-gray-800 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-teal-500/80 focus:bg-slate-200/80 dark:focus:bg-slate-700/60
          transition-all duration-300`,
  
  button: `px-4 py-2 rounded-lg font-semibold text-sm text-white 
           bg-teal-700 hover:bg-teal-800
           shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30
           transform hover:-translate-y-0.5 active:translate-y-0
           transition-all duration-200`,
  
  buttonSecondary: `px-4 py-2 rounded-lg font-semibold text-sm
                    text-gray-700 dark:text-gray-300
                    bg-slate-200/70 dark:bg-slate-800/40 hover:bg-slate-300/70 dark:hover:bg-slate-800/70
                    shadow-md shadow-slate-500/10 hover:shadow-lg
                    transform hover:-translate-y-0.5 active:translate-y-0
                    transition-all duration-200`,

  buttonSuccess: `px-4 py-2 rounded-lg font-semibold text-sm text-white
                    bg-emerald-600 hover:bg-emerald-700
                    shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30
                    transform hover:-translate-y-0.5 active:translate-y-0
                    transition-all duration-200`,
  
  card: `rounded-xl p-4
         bg-white/50 dark:bg-slate-800/50
         backdrop-blur-lg border border-white/20 dark:border-white/10
         shadow-lg shadow-black/10
         transition-all duration-300`,
  
  th: `px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider`,
  
  td: `px-4 py-3 text-sm text-gray-800 dark:text-gray-200`,

  badge: `inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold`,
  
  badgeSuccess: `bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300`,
  badgeWarning: `bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300`,
  badgeDanger: `bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300`,
  badgeInfo: `bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300`,
  badgePending: `bg-slate-200 text-slate-800 dark:bg-gray-700 dark:text-gray-300`
};
