
export default function Login(){
    return(
        <>
            <div className="bg-white p-4 rounded-sm flex flex-col m-auto w-3/6 h-72 align-middle items-center">
                <span className="text-stone-700 text-2xl font-bold">Bienvenido!</span>
                <span className="text-stone-600 text-xl mt-0">Ingrese sus datos de empleado.</span>
                <form className="flex flex-col w-full h-full">
                    <label htmlFor="user-id" className="text-stone-700 font-bold">Número de Empleado</label>
                    <input type="number" id="user-id" className="p-2 border-border rounded-sm" placeholder="Ingrese el numero de empleado..." required></input>

                    <label htmlFor="user-pass" className="text-stone-700 font-bold">Contraseña</label>
                    <input className="p-2" type="password" id="user-pass" placeholder="Ingrese el numero de empleado..." required></input>
                    <button type="submit" className="bg-stone-700 hover:bg-stone-800 transition mt-2 pt-3 pb-3 rounded-sm">Iniciar Sesión</button>
                </form>
            </div>
        </>
    )
}