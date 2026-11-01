import { Composition, Folder } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { Logo } from "./HelloWorld/Logo";
import { Title } from "./HelloWorld/Title";
import { Keynote, keynoteSchema } from "./Keynote/Keynote";
import { TOTAL_SECONDS } from "./Keynote/theme";
import { Promo, PROMO_FRAMES } from "./Promo/Promo";

// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="LeilunaKeynote"
        component={Keynote}
        schema={keynoteSchema}
        durationInFrames={TOTAL_SECONDS * 30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          footageSrc: "",
          soundtrack: true,
        }}
      />
      <Composition
        id="LeilunaSitePromo"
        component={Promo}
        durationInFrames={PROMO_FRAMES}
        fps={30}
        width={1080}
        height={1920}
      />
      <Folder name="Elements">
        <Composition
          id="Logo"
          component={Logo}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            logoColor1: "#91EAE4",
            logoColor2: "#86A8E7",
          }}
        />
        <Composition
          id="Title"
          component={Title}
          durationInFrames={115}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{
            titleText: "Welcome to Remotion",
            titleColor: "#000000",
          }}
        />
      </Folder>
      <Composition
        // You can take the "id" to render a video:
        // bunx remotion render HelloWorld
        id="HelloWorld"
        component={HelloWorld}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        // You can override these props for each render:
        // https://www.remotion.dev/docs/parametrized-rendering
        defaultProps={{
          titleText: "Welcome to Remotion",
          titleColor: "#000000",
        }}
      />

    </>
  );
};
