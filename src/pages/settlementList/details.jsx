import React , { useState }  from "react";
import { Form, TreeSelect  } from 'antd';
import ProForm, { ModalForm, ProFormText } from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';
import { Image } from 'antd';

const Details = (props) => {

  const { title, visible,defaultValues, handleCancel} = props;

  const [tab,setTab] = useState('tab1');
  const [tabs,setTabs] = useState('tabs1');
  

  return (
    <React.Fragment>
      <ModalForm
        title={title}
        visible={visible}    
        width={800}
        submitter={{
          submitButtonProps: {
            style: {
              display: 'none',
            },
          },
          searchConfig: {
            resetText: '关闭',
          },
        }}
        modalProps={{
          destroyOnClose: true,
          onCancel: () => {
            setTab('tab1')
            setTabs('tabs1')
            handleCancel()
          },
        }}
        // initialValues={defaultValues}
      >
        <ProCard
          tabs={{
            activeKey:tab,
            onChange: (key) => {
              setTab(key);
            },
          }}
      >
        <ProCard.TabPane key="tab1" tab="结算单">
          <div style= {{maxHeight:'500px',overflow:'auto',textAlign:'center'}}>
            {
              (defaultValues && defaultValues.relationZero && defaultValues.relationZero.length>0)?defaultValues.relationZero.map(items=>{
                return <Image
                          width={460}
                          src={items.attaSrc}
                          key= {items.id}
                          style={{padding:'5px'}}
                        />
                
              }):<p style = {{color:'red'}}>暂无数据</p>
            }
          </div>
        </ProCard.TabPane>
        <ProCard.TabPane key="tab2" tab="流水证明">
            <ProCard
              tabs={{
                activeKey:tabs,
                tabPosition:"left",
                onChange: (key) => {
                  setTabs(key);
                },
              }}
            >
              <ProCard.TabPane key="tabs1" tab="社保">
                <div style= {{maxHeight:'500px',overflow:'auto',textAlign:'center'}}>
                  {
                    (defaultValues&&defaultValues.relationOne&&defaultValues.relationOne.length>0)?defaultValues.relationOne.map(items=>{
                      return <Image
                          width={460}
                          src={items.attaSrc}
                          key= {items.id}
                          style={{padding:'5px'}}
                        />
                    }):<p style = {{color:'red'}}>暂无数据</p>
                  }
                </div>
              </ProCard.TabPane>
              <ProCard.TabPane key="tabs2" tab="公积金">
                <div style= {{maxHeight:'500px',overflow:'auto',textAlign:'center'}}>
                  {
                    (defaultValues&&defaultValues.relationTwo&&defaultValues.relationTwo.length>0)?defaultValues.relationTwo.map(items=>{
                      return <Image
                          width={460}
                          src={items.attaSrc}
                          key= {items.id}
                          style={{padding:'5px'}}
                        />
                    }):<p style = {{color:'red'}}>暂无数据</p>
                  }
                </div>
              </ProCard.TabPane>
              <ProCard.TabPane key="tabs3" tab="代发工资单">
              <div style= {{maxHeight:'500px',overflow:'auto',textAlign:'center'}}>
                  {
                    (defaultValues&&defaultValues.relationThree&&defaultValues.relationThree.length>0)?defaultValues.relationThree.map(items=>{
                      return <Image
                          width={460}
                          src={items.attaSrc}
                          key= {items.id}
                          style={{padding:'5px'}}
                        />
                    }):<p style = {{color:'red'}}>暂无数据</p>
                  }
                </div>
              </ProCard.TabPane>
              <ProCard.TabPane key="tabs4" tab="餐补">
                <div style= {{maxHeight:'500px',overflow:'auto',textAlign:'center'}}>
                  {
                    (defaultValues&&defaultValues.relationFour&&defaultValues.relationFour.length>0)?defaultValues.relationFour.map(items=>{
                      return <Image
                          width={460}
                          src={items.attaSrc}
                          key= {items.id}
                          style={{padding:'5px'}}
                        />
                    }):<p style = {{color:'red'}}>暂无数据</p>
                  }
                </div>
              </ProCard.TabPane>
              <ProCard.TabPane key="tabs5" tab="春节大礼包">
                <div style= {{maxHeight:'500px',overflow:'auto',textAlign:'center'}}>
                  {
                    (defaultValues&&defaultValues.relationFive&&defaultValues.relationFive.length>0)?defaultValues.relationFive.map(items=>{
                      return <Image
                          width={460}
                          src={items.attaSrc}
                          key= {items.id}
                          style={{padding:'5px'}}
                        />
                    }):<p style = {{color:'red'}}>暂无数据</p>
                    }
                </div>
              </ProCard.TabPane>
            </ProCard>
        </ProCard.TabPane>
        {/* <ProCard.TabPane key="tab3" tab="明细">
          <Image
            width={200}
            src="https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
          />
        </ProCard.TabPane> */}
      </ProCard>
      </ModalForm>
    </React.Fragment>
  )
}

export default Details;

