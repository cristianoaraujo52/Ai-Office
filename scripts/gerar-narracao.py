"""Gera os MP3 da narração com voz neural (edge-tts, pt-BR-FranciscaNeural).

Lê scripts/narracao-textos.json (gerado por scripts/narracao-textos.ts) e grava
public/audio/narracao/<chave>.mp3 + manifest.json. Só gera de novo os áudios cujo
texto mudou (hash diferente) e apaga MP3 de chaves que não existem mais.

Requer: pip install edge-tts
Executar tudo de uma vez:  npm run audio:narracao
"""
import asyncio
import json
import os
import sys

import edge_tts

VOICE = 'pt-BR-FranciscaNeural'
RATE = '-5%'
PARALELO = 4
TENTATIVAS = 3

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ENTRADA = os.path.join(RAIZ, 'scripts', 'narracao-textos.json')
SAIDA = os.path.join(RAIZ, 'public', 'audio', 'narracao')
MANIFEST = os.path.join(SAIDA, 'manifest.json')


async def gerar(item, sem, manifest, contagem):
    destino = os.path.join(SAIDA, f"{item['key']}.mp3")
    async with sem:
        for tentativa in range(1, TENTATIVAS + 1):
            try:
                temporario = destino + '.tmp'
                await edge_tts.Communicate(item['text'], VOICE, rate=RATE).save(temporario)
                os.replace(temporario, destino)
                manifest[item['key']] = item['hash']
                contagem['gerados'] += 1
                print(f"  ok  {item['key']} ({os.path.getsize(destino) // 1024} KB)", flush=True)
                return
            except Exception as erro:  # rede instável: tenta de novo
                if tentativa == TENTATIVAS:
                    contagem['falhas'] += 1
                    print(f"  FALHOU {item['key']}: {erro}", flush=True)
                else:
                    await asyncio.sleep(2 * tentativa)


async def main():
    itens = json.load(open(ENTRADA, encoding='utf-8'))
    os.makedirs(SAIDA, exist_ok=True)
    manifest = json.load(open(MANIFEST, encoding='utf-8')) if os.path.exists(MANIFEST) else {}

    chaves = {i['key'] for i in itens}
    for chave in [k for k in manifest if k not in chaves]:
        manifest.pop(chave)
        caminho = os.path.join(SAIDA, f'{chave}.mp3')
        if os.path.exists(caminho):
            os.remove(caminho)

    pendentes = [
        i for i in itens
        if manifest.get(i['key']) != i['hash'] or not os.path.exists(os.path.join(SAIDA, f"{i['key']}.mp3"))
    ]
    print(f'{len(itens)} textos, {len(pendentes)} para gerar com {VOICE}')

    contagem = {'gerados': 0, 'falhas': 0}
    sem = asyncio.Semaphore(PARALELO)
    await asyncio.gather(*(gerar(i, sem, manifest, contagem) for i in pendentes))

    with open(MANIFEST, 'w', encoding='utf-8') as f:
        json.dump(dict(sorted(manifest.items())), f, indent=1)

    total = sum(os.path.getsize(os.path.join(SAIDA, n)) for n in os.listdir(SAIDA) if n.endswith('.mp3'))
    print(f"gerados: {contagem['gerados']}  falhas: {contagem['falhas']}  pasta: {total / 1048576:.1f} MB")
    sys.exit(1 if contagem['falhas'] else 0)


asyncio.run(main())
