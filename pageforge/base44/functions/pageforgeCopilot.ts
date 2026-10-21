/** PageForge V26 — ESQUELETO Base44, nao publicado automaticamente.
 * Ajuste aos handlers/autenticacao/InvokeLLM suportados pelo runtime do seu app.
 * Nao exponha chaves nem confie em selectedId sem verificar a posse do site.
 * Entrada: {instruction:string,blocks:Array<{id,kind,...}>,selectedId:string}
 * Saida: {operations:[{type:'update_block',blockId,changes:{title,subtitle,body}}],summary:string}
 * Antes de ativar: autenticar, autorizar workspace, limitar payload/rate, validar JSON.
 */
export const CONTRACT = {
  request: ['instruction','blocks','selectedId'],
  response: ['operations','summary'],
  allowedTypes: ['update_block','add_block','move_block'],
  allowedFields: ['title','subtitle','body','description','buttonText','eyebrow','ctaText','items'],
};
