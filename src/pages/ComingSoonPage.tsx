import { commonClasses } from "../lib/commonClasses";

interface ComingSoonPageProps {
  pageTitle: string;
}

export const ComingSoonPage = ({ pageTitle }: ComingSoonPageProps) => (
  <div className={`${commonClasses.card} flex items-center justify-center h-96`}>
    <div className="text-center">
      <div className="text-5xl mb-4">🚧</div>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white">{pageTitle}</h2>
      <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">This feature will be available soon.</p>
    </div>
  </div>
);
