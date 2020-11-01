import { JsonFragment } from "@ethersproject/abi";
import { Provider } from "@ethersproject/providers";
import { defaultAbiCoder, Interface } from "ethers/lib/utils";

const { bytecode } = require("../artifacts/contracts/MultiCall.sol/MultiCall.json");

export type CallInput = {
  target: string;
  interface?: Interface | JsonFragment[];
  function: string;
  args: Array<any> | undefined;
}

function isJsonFragmentArray(input: any): input is JsonFragment[] {
  if (!Array.isArray(input)) return false;
  const callInputKeys = ['target', 'function', 'args'];
  const inputKeys = Object.keys(input[0]);
  for (let key of callInputKeys) {
    if (!inputKeys.includes(key)) return true;
  }
  return false;
}

export class MultiCall {
  constructor(private provider: Provider) {}

  public async multiCall(_interface: Interface | JsonFragment[], inputs: CallInput[]): Promise<any[]>;
  public async multiCall(inputs: CallInput[]): Promise<any[]>;
  public async multiCall(arg0: Interface | JsonFragment[] | CallInput[], arg1?: CallInput[]) {
    let inputs: CallInput[] = [];
    if (arg0 instanceof Interface || isJsonFragmentArray(arg0)) {
      if (!arg1) throw new Error(`Second parameter must be array of call inputs if first is interface.`);
      inputs = arg1;
      for (let input of inputs) {
        if (!input.interface) input.interface = arg0;
      }
    } else {
      inputs = arg0;
    }
    const targets: string[] = [];
    const datas: string[] = [];
    const interfaces: Interface[] = [];
    for (let input of inputs) {
      let _interface: Interface;
      if (!input.interface) {
        throw new Error(`Call input must include interface.`);
      }
      if (input.interface instanceof Interface) {
        _interface = input.interface;
      } else {
        _interface = new Interface(input.interface);
      }
      interfaces.push(_interface);
      const calldata = _interface.encodeFunctionData(input.function, input.args);
      datas.push(calldata);
      targets.push(input.target);
    }
    const inputData = defaultAbiCoder.encode(['address[]', 'bytes[]'], [targets, datas]);
    const fulldata = bytecode.concat(inputData.slice(2));
    const encodedReturnData = await this.provider.call({ data: fulldata });
    const returndatas = defaultAbiCoder.decode(['bytes[]'], encodedReturnData)[0];
    const results: any[] = [];
    for (let i = 0; i < inputs.length; i++) {
      const returndata = returndatas[i];
      const result = interfaces[i].decodeFunctionResult(inputs[i].function, returndata)[0];
      results.push(result);
    }
    return results;
  }
}