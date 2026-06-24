
import { LoginCard } from './LoginCard';
import { HeroBlockComponent } from './HeroBlockComponent';

import ang from '../assets/ang.png';

export const LoginComponent = () => {

    return (
        <div
            className='login-component'
            style={{
                height: '100vh',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '40px'
            }}
        >
            <div
                className='heroBlock-container'
                style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    paddingTop: '100px'
                }}
            >
                <HeroBlockComponent 
                    illustration={ ang }
                />
            </div>
            <div
                className='loginCard-container'
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-start'
                }}
            >
                <LoginCard />
            </div>
        </div>
    )
}
