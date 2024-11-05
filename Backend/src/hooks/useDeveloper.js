import { useState } from 'react'

const useUser = () => {
  const [user, setUser] = useState(null)

  const setContextUser = (userData) => setUser(userData)

  return { getUser: user, setUser: setContextUser }
}

export default useUser
