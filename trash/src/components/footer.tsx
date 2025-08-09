export const Footer = () => {
  return (
    <footer className="p-6 lg:fixed lg:bottom-0 lg:left-0">
      <div>
        src @{' '}
        <a
          href="https://enkyuan.com/ato"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block underline underline-offset-4"
        >
          ato.do
        </a>{' '}
        - made with love by {' '}
        <a
          href="https://enkyuan.me"
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-block"
        >
          enkang
        </a>
      </div>
    </footer>
  );
};
