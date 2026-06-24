import React, { useEffect } from "react";
import { Layout, type MenuProps } from "antd";
import { MenuComponent } from '../Components/MenuComponent';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import Swal from "sweetalert2";
import { useAuthActions } from "../hooks/useAuthActions";
import { useStore } from "zustand";



const LayoutApp: React.FC = () => {

  const navigate = useNavigate();
  const userStore  = useAuthStore( state => state.user );
  // const {handleUnverifiedUser} =  useAuthActions( );

  useEffect(() => {
    // if ( userStore?.is_verified ){
    //   return;
    // }

    // const handleEmailNotVerified = () => {
    //   if (userStore?.email) {
    //     handleUnverifiedUser(userStore.email);
    //   }
    // };

    // window.addEventListener('auth:email_not_verified', handleEmailNotVerified);
    
    if (userStore && userStore.active === false) {
        
        Swal.fire({
            icon: 'error',
            title: 'Cuenta Desactivada',
            text: 'Tu usuario está actualmente desactivado, contacta con la administración para que te reactiven.',
            confirmButtonText: 'Entendido',
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                navigate("/login");
            }
        });
    }

    // return () => {
    //   window.removeEventListener('auth:email_not_verified', handleEmailNotVerified);
    // };

  }, [userStore])
  


  const items: MenuProps['items'] = [
    {
      key: '1',
      label: (
        <div>
          <UserOutlined style={{ marginRight:'10px' }} />
          rafael.nava.1403@gmail.com
        </div>
      ),
      disabled: true
    },
    // {
    //   key: '2',
    //   label: (
    //     <a target="_blank" rel="noopener noreferrer" href="https://www.aliyun.com">
    //       2nd menu item (disabled)
    //     </a>
    //   ),
    //   icon: <SmileOutlined />,
    //   disabled: true,
    // },
    // {
    //   key: '3',
    //   label: (
    //     <a target="_blank" rel="noopener noreferrer" href="https://www.luohanacademy.com">
    //       3rd menu item (disabled)
    //     </a>
    //   ),
    //   disabled: true,
    // },
    {
      key: '4',
      danger: true,
      icon: <LogoutOutlined />,
      label: 'Log out',
    },
  ];


  return (
    <Layout className="layout-app" >
      <MenuComponent />

      {/* Contenido Principal */}
      <Layout className="layout-app__content">
        
        {/* <section
          style={{
            height: '65px'
          }}
        >
          <Row style={{ height: '100%' }}>
            <Col md={20}>
            </Col>
            <Col 
              md={4}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Dropdown
                menu={{ items }}
              >
                <Avatar size={44} icon={<UserOutlined />} />
              </Dropdown>
            </Col>
          </Row>
        </section> */}

        {/* <div className="tabs-container">
          <EditorStudioComponent />
        </div> */}
        <div className="tabs-container">
          <Outlet />
        </div>
      </Layout>
    </Layout>
  );
};

export default LayoutApp;