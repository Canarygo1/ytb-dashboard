// ** React Imports
import { createContext, useEffect, useState, ReactNode } from 'react'

// ** Next Import
import { useRouter } from 'next/router'

// ** Axios
import axios from 'axios'

// ** Config
import authConfig from 'src/configs/auth'

// ** Types
import { AuthValuesType, RegisterParams, LoginParams, ErrCallbackType, UserDataType } from './types'

// ** Defaults
const defaultProvider: AuthValuesType = {
  user: null,
  loading: true,
  setUser: () => null,
  setLoading: () => Boolean,
  isInitialized: false,
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  setIsInitialized: () => Boolean,
  register: () => Promise.resolve()
}

const AuthContext = createContext(defaultProvider)

type Props = {
  children: ReactNode
}

const AuthProvider = ({ children }: Props) => {
  // ** States
  const [user, setUser] = useState<UserDataType | null>(defaultProvider.user)
  const [loading, setLoading] = useState<boolean>(defaultProvider.loading)
  const [isInitialized, setIsInitialized] = useState<boolean>(defaultProvider.isInitialized)

  // ** Hooks
  const router = useRouter()

  useEffect(() => {
    if (!router.isReady) return;

    const initAuth = async (): Promise<void> => {
      //setIsInitialized(true);
      //setLoading(true);
      console.log('channel');
      setLoading(false)

      // Obtener el channelId del enrutador
      const channelId = router.query.channelId;
      console.log('vacio',channelId);
      const channel = window.localStorage.getItem('channelId');
      console.log('channel', channel);

      if (channel) {
        const userType: UserDataType = {
          id: 3,
          role: 'admin',
          email: 'canarygo1@gmail.com',
          avatar: '/images/avatars/1.jpg',
          fullName: 'BLV',
          password: '123456',
          username: 'canarygo1',
        };

        if (channelId !== undefined &&  channel != channelId) {
          window.localStorage.setItem("channelId", channelId as string);

        }
        window.localStorage.setItem('userData', JSON.stringify(userType));
        setUser(userType);
        setLoading(false);


      } else {
        if (channelId) {
          window.localStorage.setItem("channelId", channelId as string);
          window.localStorage.setItem(authConfig.storageTokenKeyName, "res.data.accessToken");

          const userType: UserDataType = {
            id: 3,
            role: 'admin',
            email: 'canarygo1@gmail.com',
            avatar: '/images/avatars/1.jpg',
            fullName: 'BLV',
            password: '123456',
            username: 'canarygo1',
          };
          window.localStorage.setItem('userData', JSON.stringify(userType));
          setUser(userType);
        } else {
          localStorage.removeItem('userData');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('accessToken');
          setUser(null);
        }
        setLoading(false);

      }
    }
    initAuth();
  }, [router.isReady]);

  const handleLogin = (params: LoginParams, errorCallback?: ErrCallbackType) => {
    axios
      .post(authConfig.loginEndpoint, params)
      .then(async res => {
        window.localStorage.setItem(authConfig.storageTokenKeyName, res.data.accessToken)
      })
      .then(() => {
        axios
          .get(authConfig.meEndpoint, {
            headers: {
              Authorization: window.localStorage.getItem(authConfig.storageTokenKeyName)!
            }
          })
          .then(async response => {
            const returnUrl = router.query.returnUrl

            setUser({ ...response.data.userData })
            await window.localStorage.setItem('userData', JSON.stringify(response.data.userData))

            const redirectURL = returnUrl && returnUrl !== '/' ? returnUrl : '/'

            router.replace(redirectURL as string)
          })
      })
      .catch(err => {
        if (errorCallback) errorCallback(err)
      })
  }

  const handleLogout = () => {
    setUser(null)
    setIsInitialized(false)
    window.localStorage.removeItem('userData')
    window.localStorage.removeItem('channelId')
    window.localStorage.removeItem(authConfig.storageTokenKeyName)
    router.push('/login')
  }

  const handleRegister = (params: RegisterParams, errorCallback?: ErrCallbackType) => {
    axios
      .post(authConfig.registerEndpoint, params)
      .then(res => {
        if (res.data.error) {
          if (errorCallback) errorCallback(res.data.error)
        } else {
          handleLogin({ email: params.email, password: params.password })
        }
      })
      .catch((err: { [key: string]: string }) => (errorCallback ? errorCallback(err) : null))
  }

  const values = {
    user,
    loading,
    setUser,
    setLoading,
    isInitialized,
    setIsInitialized,
    login: handleLogin,
    logout: handleLogout,
    register: handleRegister
  }

  return <AuthContext.Provider value={values}>{children}</AuthContext.Provider>
}

export { AuthContext, AuthProvider }
