import React from 'react';
import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";

const ExcalidrawWrapper = (props: React.ComponentProps<typeof Excalidraw>) => {
    return (
        <Excalidraw
            {...props}
            UIOptions={{
                ...props.UIOptions,
                welcomeScreen: false
            }}
        >
            <MainMenu>
                <MainMenu.DefaultItems.ClearCanvas />
                <MainMenu.DefaultItems.SaveAsImage />
                <MainMenu.DefaultItems.ChangeCanvasBackground />
                {/* Removed Social Links (GitHub, Discord, etc) */}
            </MainMenu>
        </Excalidraw>
    );
};

export default ExcalidrawWrapper;
