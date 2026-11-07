# -*- coding: utf-8 -*-
"""Adiciona codigo + assinatura a todos os alimentos do database.json (Romerito)."""
import json, hashlib, unicodedata, collections, sys

PFX='RM'
def norm(s):
    s=unicodedata.normalize('NFKD',str(s)).encode('ascii','ignore').decode()
    return ' '.join(s.lower().strip().split())
def ass(s,n=6):
    AL='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    v=int.from_bytes(hashlib.sha256(s.encode()).digest()[:8],'big'); o=''
    for _ in range(n): o+=AL[v%32]; v//=32
    return o
def ver(s):
    return hashlib.sha256(s.encode()).hexdigest()[:8].upper()

FAM_INS=[('limpeza','LIM'),('latic','LAT'),('hortifruit','HFR'),('hortifruti','HFR'),('carne','PRT'),
         ('peixe','PEX'),('pescado','PEX'),('ovas','OVA'),('caviar','OVA'),('congelad','CGL'),
         ('produção interna','PRD'),('producao interna','PRD'),('seco','SEC'),('mercearia','SEC')]
FAM_CAR={'entrada':'ENT','parrilla':'PAR','acompanhamento':'ACP','prato principal':'PPL','kids':'KID','sobremesa':'SOB'}

def fam_insumo(cat):
    c=norm(cat or '')
    for k,v in FAM_INS:
        if k in c: return v
    return 'GEN'

d=json.load(open('db.json',encoding='utf-8'))
rel=collections.Counter()

# --- ESTOQUE ---
seq=collections.Counter(); ass_map=collections.defaultdict(list)
for it in d['estoque']:
    f=fam_insumo(it.get('categoria'))
    seq[f]+=1
    it['codigo']=f"{PFX}-{f}-{seq[f]:03d}"
    it['assinatura']=ass(f"{f}|{norm(it.get('insumo'))}|{norm(it.get('unidade'))}")
    ass_map[it['assinatura']].append(it['insumo'])
rel['estoque_codificados']=len(d['estoque'])

# --- CARDAPIO ---
seqc=collections.Counter()
for key in ('cardapio','cardapio_variados'):
    for it in d.get(key,[]):
        f=FAM_CAR.get(norm(it.get('categoria')),'PRT')
        seqc[f]+=1
        it['codigo']=f"{PFX}-{f}-{seqc[f]:03d}"
        it['assinatura']=ass(f"{f}|{norm(it.get('prato'))}|{norm(it.get('categoria'))}")
        ass_map[it['assinatura']].append(it.get('prato'))
        rel[key+'_codificados']+=1

# --- RECIPES (versao da composicao) ---
by_nome={}
for k in ('cardapio_variados','cardapio'):
    for x in d.get(k,[]):
        by_nome[norm(x.get('prato'))]=x.get('codigo')
sem_prato=0
for r in d['recipes']:
    ing=norm(r.get('ingredientes'))
    r['assinatura_versao']=ver(ing)
    c=by_nome.get(norm(r.get('nome')))
    if c: r['prato_codigo']=c
    else: sem_prato+=1
rel['recipes_assinadas']=len(d['recipes'])
rel['recipes_sem_prato']=sem_prato

# --- PORCIONAMENTO ---
for p in d.get('porcionamento',[]):
    c=by_nome.get(norm(p.get('nome')))
    if c: p['prato_codigo']=c
    else: rel['porcionamento_sem_prato']+=1

json.dump(d,open('db_migrado.json','w',encoding='utf-8'),ensure_ascii=False,indent=4)

dups={k:v for k,v in ass_map.items() if len(v)>1}
print('RELATORIO DE MIGRACAO')
for k,v in rel.items(): print(f'  {k:<28} {v}')
print('\nDUPLICATAS POR ASSINATURA: '+str(len(dups)))
for k,v in list(dups.items())[:12]:
    print('  ',k,'->',', '.join(v)[:110])
print('\nAMOSTRA ESTOQUE:')
for it in d['estoque'][:6]: print(f"  {it['codigo']:<12}{it['assinatura']}  {it['insumo'][:34]:<36}{it.get('categoria','')[:22]}")
print('\nAMOSTRA CARDAPIO:')
for it in d['cardapio'][:6]: print(f"  {it['codigo']:<12}{it['assinatura']}  {it['prato'][:34]:<36}{it['categoria']}")
print('\nAMOSTRA RECIPES:')
for r in d['recipes'][:4]: print(f"  {r.get('prato_codigo','—'):<12}{r['assinatura_versao']}  {r['nome'][:40]}")
