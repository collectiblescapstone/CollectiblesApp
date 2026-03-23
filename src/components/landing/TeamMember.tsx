import React from 'react'

export interface LinkItem {
    href: string
    label?: string
    icon?: React.ReactNode
}

interface TeamMemberProps {
    name: string
    role: string
    links?: LinkItem[]
    description?: React.ReactNode
}

const TeamMember: React.FC<TeamMemberProps> = ({
    name,
    role,
    links = [],
    description
}) => {
    return (
        <div>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                }}
            >
                <strong>{name}</strong> — {role}
                {links.length > 0 && (
                    <div
                        className="links"
                        style={{
                            display: 'flex',
                            gap: '8px',
                            alignItems: 'center',
                            marginLeft: '8px'
                        }}
                    >
                        {links.map((l, i) => (
                            <a
                                key={i}
                                href={l.href}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`Open ${name} ${l.label ?? 'profile'}`}
                            >
                                {l.icon}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {description && (
                <div style={{ marginTop: '8px' }}>{description}</div>
            )}
        </div>
    )
}

export default TeamMember
