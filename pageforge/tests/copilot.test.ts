import {describe,it,expect,vi,afterEach} from 'vitest';

const {invokeCopilot}=vi.hoisted(()=>({invokeCopilot:vi.fn()}));
vi.mock('../src/integrations/base44',()=>({invokeCopilot,base44AppId:'test-app'}));

import {requestCopilot,type AIRequest} from '../src/lib/pageforge-ai';

const request:AIRequest={instruction:'Transforme esta hero em uma empresa de robotica',blocks:[{id:'b1',kind:'hero',title:'Old hero'}],selectedId:'b1'};
const backendResponse={operations:[{type:'update_block',blockId:'b1',changes:{title:'Engineering the next generation'}}],summary:'Hero reescrita'};

afterEach(()=>{invokeCopilot.mockReset()});

describe('AI copilot backend (Base44 function)',()=>{
  it('sends the request to the app function and returns validated operations',async()=>{
    invokeCopilot.mockResolvedValue(backendResponse);
    const result=await requestCopilot(request,'base44');
    expect(invokeCopilot).toHaveBeenCalledWith(expect.objectContaining({instruction:request.instruction,selectedId:'b1'}));
    expect(result).toMatchObject({mode:'base44',summary:'Hero reescrita'});
    expect(result.operations).toEqual(backendResponse.operations);
  });
  it('needs no backend for mock mode',async()=>{
    const result=await requestCopilot(request,'mock');
    expect(result.mode).toBe('mock');
    expect(result.operations[0]).toMatchObject({type:'update_block',blockId:'b1'});
    expect(invokeCopilot).not.toHaveBeenCalled();
  });
  it('rejects fields outside the allowed contract',async()=>{
    invokeCopilot.mockResolvedValue({operations:[{type:'update_block',blockId:'b1',changes:{onclick:'alert(1)'}}],summary:'x'});
    await expect(requestCopilot(request,'base44')).rejects.toThrow('Campo nao permitido: onclick');
  });
  it('reports a backend failure with a readable message',async()=>{
    invokeCopilot.mockRejectedValue(new Error('Function not found'));
    await expect(requestCopilot(request,'base44')).rejects.toThrow('Backend Base44 nao respondeu: Function not found');
  });
  it('explains an unpublished function on HTTP 404',async()=>{
    invokeCopilot.mockRejectedValue(Object.assign(new Error('Request failed with status code 404'),{status:404}));
    await expect(requestCopilot(request,'base44')).rejects.toThrow('a funcao pageforgeCopilot ainda nao esta publicada');
  });
});
