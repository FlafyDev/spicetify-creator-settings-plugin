import React, { useState } from 'react'
import ReactDOM from 'react-dom';
import styles from './settings.module.css'

class SettingsSection {
  settingsFields: SettingsField[] = [];
  private stopHistoryListener: any;
  private setRerender: Function | null = null;

  constructor(public name: string, public settingsId: string) {
    settingsId += '.settings';
  }

  pushSettings = async () => {
    while (!Spicetify?.Platform?.History?.listen) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  
    if (this.stopHistoryListener)
      this.stopHistoryListener();

    this.stopHistoryListener = Spicetify.Platform.History.listen((e: any) => {
      if (e.pathname === '/preferences') {
        this.render();
      }
    })
    
    if (Spicetify.Platform.History.location.pathname === '/preferences') {
      await this.render();
    }
  }

  rerender = () => {
    if (this.setRerender) {
      this.setRerender(Math.random());
    }
  }

  private render = async () => {
    while (!document.getElementById('desktop.settings.selectLanguage')) {
      if (Spicetify.Platform.History.location.pathname !== '/preferences') return;
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    const allSettingsContainer = document.getElementsByClassName('x-settings-container')[0];
    let pluginSettingsContainer: Element | null = null;
  
    for (let i = 0; i < allSettingsContainer.children.length; i++) {
      if (allSettingsContainer.children[i].id === this.settingsId) {
        pluginSettingsContainer = allSettingsContainer.children[i];
      }
    }
  
    if (!pluginSettingsContainer) {
      pluginSettingsContainer = document.createElement('div');
      pluginSettingsContainer.id = this.settingsId;
      pluginSettingsContainer.className = styles.settingsContainer;
      let advancedOptionsButton: Element | undefined;
      const buttons = allSettingsContainer.getElementsByClassName('x-settings-button')
      for (let i = 0; i < buttons.length; i++) {
        if (buttons[i].children[0].textContent === 'Show advanced settings') {
          advancedOptionsButton = buttons[i]
          break;
        }
      }
  
      allSettingsContainer.insertBefore(pluginSettingsContainer, advancedOptionsButton!);
    } else {
      console.log(pluginSettingsContainer)
    }

    ReactDOM.render(<this.FieldsContainer />, pluginSettingsContainer)
  }
  
  addButton = (nameId: string, description: string, value: string, onClick?: () => void) => {
    this.settingsFields.push({
      type: "button",
      nameId: nameId,
      description: description,
      defaultValue: value,
      callback: onClick,
    });
  }

  addInput = (nameId: string, description: string, defaultValue: string, onChange?: () => void) => {
    this.settingsFields.push({
      type: "input",
      nameId: nameId,
      description: description,
      defaultValue: defaultValue,
      callback: onChange,
    });
  }

  addToggle = (nameId: string, description: string, defaultValue: boolean, onInput?: () => void) => {
    this.settingsFields.push({
      type: "toggle",
      nameId: nameId,
      description: description,
      defaultValue: defaultValue,
      callback: onInput,
    });
  }

  addDropDown = (nameId: string, description: string, options: string[], defaultIndex: number, onSelect?: () => void) => {
    this.settingsFields.push({
      type: "dropdown",
      nameId: nameId,
      description: description,
      defaultValue: options[defaultIndex],
      callback: onSelect,
      options: options,
    });
  }

  getFieldValue = (nameId: string): any => {
    return JSON.parse(Spicetify.LocalStorage.get(`${this.settingsId}.${nameId}`) || "{}")?.value;
  }

  setFieldValue = (nameId: string, newValue: any) => {
    Spicetify.LocalStorage.set(`${this.settingsId}.${nameId}`, JSON.stringify({value:newValue}));
  }

  private FieldsContainer = () => {
    const [rerender, setRerender] = useState<number>(0);
    this.setRerender = setRerender;

    return <div className={styles.settingsContainer} key={rerender}>
      <h2 className="main-shelf-title main-type-cello">{this.name}</h2>
      {this.settingsFields.map(field => {
        return <this.Field field={field} />
      })}
    </div>
  }

  private Field = (props: {field: SettingsField}) => {
    const id = `${this.settingsId}.${props.field.nameId}`;
    
    let defaultStateValue;
    if (props.field.type != "button") {
      if (this.getFieldValue(props.field.nameId) === undefined) {
        this.setFieldValue(props.field.nameId, props.field.defaultValue);
      }
      defaultStateValue = this.getFieldValue(props.field.nameId);
    } else {
      defaultStateValue = props.field.defaultValue;
    }

    const [value, setValueState] = useState(defaultStateValue);
    
    const setValue = (newValue?: any) => {
      if (newValue !== undefined) {
        setValueState(newValue);
        this.setFieldValue(props.field.nameId!, newValue);
      }
      if (props.field.callback)
        props.field.callback();
    }

    return <>
      <div className="main-type-mesto" style={{color: 'var(--spice-subtext)'}}><label htmlFor={id}>
        {props.field.description}
      </label></div>
      <span className="x-settings-secondColumn">
        {
          props.field.type === 'input' ? 
            <input className="main-dropDown-dropDown" id={id} dir="ltr" value={value as string} type={"text"} onChange={(e) => {
              setValue(e.currentTarget.value);
            }} /> :

          props.field.type === 'button' ? 
            <span className="x-settings-button">
              <button id={id} onClick={() => {
                setValue();
              }} className="main-buttons-button main-button-outlined" type="button">
                {value}
              </button>
            </span> :

          props.field.type === 'toggle' ?
            <label className="x-toggle-wrapper x-settings-secondColumn">
              <input id={id} className="x-toggle-input" type="checkbox" checked={value as boolean} onClick={(e) => {
                setValue(e.currentTarget.checked);
              }} />
              <span className="x-toggle-indicatorWrapper">
                <span className="x-toggle-indicator">
                </span>
              </span>
            </label> :
          
          props.field.type === 'dropdown' ?
            <select className="main-dropDown-dropDown" id={id} onChange={(e) => {
              setValue(props.field.options![e.currentTarget.selectedIndex])
            }}>
              {
                props.field.options!.map((option, i) => {
                  return <option selected={option === value} value={i+1}>{option}</option>
                })
              }
            </select> : <></>
        }
      </span>
    </>
  }


}

interface SettingsField {
  type: "button" | "toggle" | "input" | "dropdown",
  nameId: string,
  description: string,
  defaultValue: any,
  callback?: () => void,
  options?: string[],
}

export { SettingsSection };