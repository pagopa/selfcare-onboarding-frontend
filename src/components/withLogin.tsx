import { useContext, useEffect } from 'react';
import { useLogin } from '../hooks/useLogin';
import { UserContext } from '../lib/context';

// eslint-disable-next-line @typescript-eslint/ban-types
type LoginProps = {};

export function withLogin<T extends LoginProps>(WrappedComponent: React.ComponentType<T>) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  const ComponentWithLogin = (props: Omit<T, keyof LoginProps>) => {
    const { user } = useContext(UserContext);
    const { attemptSilentLogin } = useLogin();

    useEffect(() => {
      async function asyncAttemptSilentLogin() {
        await attemptSilentLogin();
      }

      if (!user) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        asyncAttemptSilentLogin();
      }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return <WrappedComponent {...(props as T)} />;
  };

  // eslint-disable-next-line functional/immutable-data
  ComponentWithLogin.displayName = `withLogin(${displayName})`;

  return ComponentWithLogin;
}
