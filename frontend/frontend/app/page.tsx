'use client'
import { useEffect, useState } from "react"

export default function Home() {
  const [mensaje, setMensaje] = useState('Esperando conexion...')
  const [conectado, setConectado] = useState(false)

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000')

    ws.onopen = () => {
      setConectado(true)
      console.log('Conectado al WebSocket')
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setMensaje(data.mensaje)
    }

    ws.onclose = () => {
      setConectado(false);
      console.log('Desconectado del WebSocket')
    }

    return () => {
      ws.close()
    }
  }, [])

  return(
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-2xl font-bold mb-4">Frontend Next.js + WebSocket</h1>
      <p className="text-lg">
        Estado: <span className={conectado ? 'text-green-500 font-semibold' : 'text-red-500 font-semibold'}>
          {conectado ? 'Conectado' : 'Desconectado'}
        </span>
      </p>
      <p className="mt-2 text-gray-600">Mensaje del servidor: {mensaje}</p>
    </main>
  )
}

async function getHealth(){
  const res = await fetch('http:localhost:3000/health', {
    cache: 'no-store'
  })

  if (!res.ok) throw new Error('Error al cargar los datos');
  return res.json();
}

export async function HealthPage() {
  const health = await getHealth();

  return(
    <ul className="p-6">
      <li>Hola</li>
    </ul>
  )
}