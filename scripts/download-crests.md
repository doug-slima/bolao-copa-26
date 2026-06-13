# Como adicionar os escudos das seleções

## Opção 1: Download manual do FootyLogos (Recomendado)

1. Acesse https://www.footylogos.com/national-team-logos
2. Para cada seleção, baixe o SVG do escudo
3. Salve na pasta `public/crests/` com o código da seleção:
   - Brasil: `public/crests/BRA.svg`
   - Argentina: `public/crests/ARG.svg`
   - etc.

### Lista das 48 seleções (TLA codes):

**Grupo A:** MEX, RSA, KOR, CZE
**Grupo B:** CAN, BIH, QAT, SUI
**Grupo C:** BRA, MAR, HAI, SCO
**Grupo D:** USA, PAR, AUS, TUR
**Grupo E:** GER, CUW, CIV, ECU
**Grupo F:** NED, JPN, SWE, TUN
**Grupo G:** BEL, EGY, IRN, NZL
**Grupo H:** ESP, CPV, KSA, URU
**Grupo I:** FRA, SEN, IRQ, NOR
**Grupo J:** ARG, ALG, AUT, JOR
**Grupo K:** POR, COD, UZB, COL
**Grupo L:** ENG, CRO, GHA, PAN

## Opção 2: Usar o pack pago do FootyLogos

Por $7.99 você pode baixar todos os 48 escudos em SVG e PNG:
https://www.footylogos.com/packs/fifa-world-cup-2026

## Depois de adicionar os arquivos

Atualize o arquivo `src/lib/team-crests.ts`:

```typescript
export const teamCrests: Record<string, string> = {
  BRA: "/crests/BRA.svg",
  ARG: "/crests/ARG.svg",
  // ... adicione todas as seleções
};
```

## Fallback atual

Enquanto os escudos não forem adicionados, o sistema usa emojis de bandeira:
🇧🇷 Brasil, 🇦🇷 Argentina, etc.
