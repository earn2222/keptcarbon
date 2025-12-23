import React from 'react'
import { NavLink as RouterNavLink } from 'react-router-dom'

const NavItem = ({
    to,
    icon: Icon,
    label,
    badge,
    exact = false,
    className = ''
}) => {
    return (
        <RouterNavLink
            to={to}
            exact={exact}
            className={(isActive) => `
        flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all
        ${className}
      `}
            activeClassName="bg-[#3cc2cf] text-white shadow-lg shadow-[#3cc2cf]/40"
        >
            {({ isActive }) => (
                <>
                    {Icon && <Icon size={20} />}
                    <span>{label}</span>
                    {badge && (
                        <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${isActive ? 'bg-white/20 text-white' : 'bg-[#3cc2cf] text-white'
                            }`}>
                            {badge}
                        </span>
                    )}
                </>
            )}
        </RouterNavLink>
    )
}

// Simple version for sidebar
const SidebarNavItem = ({
    to,
    icon: Icon,
    label,
    badge,
    exact = false,
    isActive = false,
}) => {
    return (
        <RouterNavLink
            to={to}
            exact={exact}
            className={`
        flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all
        ${isActive
                    ? 'bg-[#3cc2cf] text-white shadow-lg shadow-[#3cc2cf]/40'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }
      `}
            activeClassName="bg-[#3cc2cf] text-white shadow-lg shadow-[#3cc2cf]/40"
        >
            {Icon && <Icon size={20} />}
            <span>{label}</span>
            {badge && (
                <span className="ml-auto px-2 py-0.5 rounded-full text-xs font-semibold bg-white/20">
                    {badge}
                </span>
            )}
        </RouterNavLink>
    )
}

export { NavItem, SidebarNavItem }
export default NavItem
