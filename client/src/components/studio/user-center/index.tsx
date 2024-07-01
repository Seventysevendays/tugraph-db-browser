import { QuestionCircleOutlined } from '@ant-design/icons';
import { Divider, Dropdown, Menu, Space, Tooltip, message } from 'antd';
import { isEmpty } from 'lodash';
import React from 'react';
import { useImmer } from 'use-immer';
import { useAuth } from '@/components/studio/hooks/useAuth';
import { getLocalData, setLocalData } from '../utils/localStorage';
import EditPasswordModal from './edit-password';
import { USER_HELP_LINK } from '../constant';
import { useModel } from 'umi';
import { InitialState } from '@/app';

type Prop = {};
export const UserCenter: React.FC<Prop> = () => {
  const { initialState } = useModel('@@initialState');
  const { driver } = initialState as InitialState;
  const { onLogout } = useAuth();
  const [state, updateState] = useImmer<{ isEditPassword: boolean }>({
    isEditPassword: false,
  });
  const { isEditPassword } = state;
  const handleLogout = () => {
    driver.close();
    window.location.hash = '/login';
  };
  const items = [
    {
      key: '1',
      label: (
        <div
          onClick={() => {
            // updateState(draft => {
            //   draft.isEditPassword = true;
            // });
            window.location.hash = '/reset';
          }}
        >
          修改密码
        </div>
      ),
    },
    {
      key: '2',
      label: <div onClick={handleLogout}>退出登录</div>,
    },
  ];
  const menu = <Menu items={items} />;
  return (
    <div>
      <Space split={<Divider type="vertical" />}>
        <Tooltip title="用户帮助">
          <QuestionCircleOutlined
            onClick={() => {
              window.open(USER_HELP_LINK);
            }}
          />
        </Tooltip>
        <Dropdown overlay={menu} trigger={['click']}>
          <a style={{ color: 'black' }}>
            {isEmpty(getLocalData('TUGRAPH_USER_NAME'))
              ? ''
              : getLocalData('TUGRAPH_USER_NAME')}
          </a>
        </Dropdown>
      </Space>

      <EditPasswordModal
        open={isEditPassword}
        onCancel={() => {
          updateState(draft => {
            draft.isEditPassword = false;
          });
        }}
      />
    </div>
  );
};
