import { useEditor } from "@/hooks/editor-provider";
import React from "react";
import { Input } from "@/components/ui/input"; // Assuming you have an Input component
import { onContentChange } from "@/lib/editor-utils";
import { useNodeConnections } from "@/hooks/connections-providers";
import { Option } from "@/lib/types";

const trainFluxNodeOptions: Option[] = [
  { images_data_url: { placeholder: "Enter images data URL", type: "text" } },
  { trigger_word: { placeholder: "Enter trigger word", type: "text" } },
  { iter_multiplier: { placeholder: 1, type: "number" } },
];

const TrainFlux = (nodeConnectionType: any, title: string) => {
  const { selectedNode } = useEditor().state.editor;
  const { state } = useEditor();
  const { nodeConnection } = useNodeConnections();
  const [params, setParams] = React.useState<any>({
    images_data_url: null,
    trigger_word: null,
    iter_multiplier: null,
  });

  return (
    <div className="flex flex-col gap-2">
      {trainFluxNodeOptions.map((optionObj) => {
        const optionKey = Object.keys(optionObj)[0];
        const optionValue = optionObj[optionKey];

        return (
          <div key={optionKey}>
            <p className="block text-sm font-medium text-gray-300">
              Enter Your{" "}
              {optionKey.charAt(0).toUpperCase() + optionKey.slice(1)} here
            </p>
            <Input
              type={optionValue.type}
              placeholder={
                optionValue.placeholder
                  ? optionValue.placeholder.toString()
                  : ""
              }
              value={
                params[optionKey] ??
                nodeConnectionType.nodeConnectionType[selectedNode.id]?.[
                  optionKey
                ]
              }
              onChange={(event) => {
                setParams((prevParams: any) => ({
                  ...prevParams,
                  [optionKey]: event.target.value,
                }));
                if (nodeConnectionType.nodeConnectionType[selectedNode.id]) {
                  nodeConnectionType.nodeConnectionType[selectedNode.id][
                    optionKey
                  ] = event.target.value;
                }
               
                onContentChange(
                  state,
                  nodeConnection,
                  "train-flux",
                  event,
                  optionKey
                );
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default TrainFlux;
