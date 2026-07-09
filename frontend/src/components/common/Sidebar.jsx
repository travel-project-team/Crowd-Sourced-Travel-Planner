// citation: https://youtu.be/JVCU2qsGvOs?si=iVz1N7_lr78bsDkh
import { NavLink } from "react-router-dom"
export const Siderbar = () => {
    return (
        <aside className="w-60 bg-gray-900 text-white min-h-screen p-4">
            <h2 className="text-xl font-bold mb-6"> Crowd Sourced Travel Planner</h2>
            <nav>
                <NavLink className="block hover:text-blue-400 p-2 my-4">Home</NavLink>
                <NavLink className="block hover:text-blue-400 p-2 my-4">Discover</NavLink>
            </nav>
        </aside>
    )
}