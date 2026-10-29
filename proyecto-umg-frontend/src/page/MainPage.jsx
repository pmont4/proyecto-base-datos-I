import { useState } from 'react';
import { Sidebar } from '../components/Sidebar/Sidebar';
import { MENU_OPTIONS } from './menuOptions';
import './MainPage.css';

export const MainPage = () => {

    const [activeOption, setActiveOption] = useState(MENU_OPTIONS[0].id);

    const ActiveComponent = MENU_OPTIONS.find(({ id }) => id === activeOption)?.component;

    return (
        <main className="main-page">
            <section className="main-container">
                <Sidebar
                    options={MENU_OPTIONS}
                    activeOption={activeOption}
                    onSelect={setActiveOption}
                />

                <div className="main-container__content">
                    {ActiveComponent && <ActiveComponent />}
                </div>
            </section>
        </main>
    );

};
