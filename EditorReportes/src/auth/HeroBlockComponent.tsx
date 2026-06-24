import Title from 'antd/es/typography/Title'

interface HeroBlockProps {
  illustration: string; // pass the imported image here (e.g. ang)
}

export const HeroBlockComponent = ({ illustration }: HeroBlockProps) => {
    return (
        <div
            style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',   // left-align content
            justifyContent: 'center',
            padding: '0 24px',          // a little breathing room
            maxWidth: 480,              // keeps text from stretching too wide
            gap: 24,                    // space between headline and image
            }}
        >
            {/* Headline */}
            <Title
                level={1}
                style={{
                    margin: 0,
                    lineHeight: 1.15,
                    fontWeight: 700,
                }}
            >
                Transforma tus datos<br />
                en documentos claros<br />
                y profesionales
            </Title>

            {/* Illustration */}
            <img
                src={illustration}
                alt="Ilustración de usuario generando un reporte"
                style={{ width: 300, maxWidth: '100%' }}
            />
        </div>
    )
}
