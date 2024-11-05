import axios from 'axios'
import Context from '../contexts/Context'
import { useContext, useEffect } from 'react'
import { ENDPOINT } from '../config/constans'

const Home = () => {
  const { setUser } = useContext(Context)

  const getUserData = () => {
    const token = window.sessionStorage.getItem('token')
    if (token) {
      axios.get(ENDPOINT.users, { headers: { Authorization: `Bearer ${token}` } })
        .then(({ data: [user] }) => setUser({ ...user }))
        .catch(() => {
          window.sessionStorage.removeItem('token')
          setUser(null)
        })
    }
  }

  useEffect(getUserData, [])
  return (    
    <div className='py-5'>
      <h1>
        ¡Bienvenido a <span className='fw-bold'>Coworks!</span>
      </h1>
      <h4>
        Un espacio de trabajo flexible que ofrece servicios de oficina virtual <br />
        adaptados a tus necesidades. ¡Explora nuestras instalaciones y disfruta de un ambiente colaborativo!
      </h4>
    </div>
  )
}

export default Home
