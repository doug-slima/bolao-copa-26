#!/bin/bash
# Script para baixar os escudos das seleções da Copa 2026 do FootyLogos
# CDN: cdn.prod.website-files.com

CRESTS_DIR="../public/crests"
mkdir -p "$CRESTS_DIR"

echo "Baixando escudos das seleções da Copa 2026..."

# URLs extraídas do FootyLogos CDN (baseado no HTML da página)
declare -A CRESTS=(
  # SVG disponíveis
  ["AUT"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/68f9fc172630205d3271b9f1_austria-national-team-footballlogos-org.svg"
  ["BIH"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/68fd1a0bb96a229b28eff9ca_bosnia-and-herzegovina-footballlogos-org.svg"
  ["COL"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/68f9fd84ab47946a360b482d_colombia-national-team-footballlogos-org.svg"
  ["CRO"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/68f9fe732030ba1891c2c1e7_croatia-national-team-footballlogos-org.svg"
  ["COD"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/68fd1b5eda26ecde0ae4f1eb_dr-congo-footballlogos-org.svg"
  ["NOR"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/68fa03b401a24ac6badeaa5c_norway-national-team-footballlogos-org.svg"
  ["PAN"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/68fa03e45d0722bd9f321589_panama-national-team-footballlogos-org.svg"
  ["QAT"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/68fd1f8e1cc7aebc6fcfff34_qatar-national-team-footballlogos-org.svg"
  
  # PNG (maioria das seleções)
  ["ALG"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b39fec61707555515b17e_68f9faa3abd65d5f6209b2cd_algeria-national-team-footballlogos-org.png"
  ["ARG"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a1048bb2071e9deee459c12_6a104445459be40714bd9774_argentina-national-team-footylogos.png"
  ["AUS"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a10e35263d68e6f439e_69fa8abfc42edca0f730781a_australia-national-team-footylogos.png"
  ["BEL"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a0fe2c051dd81874aac_68f9fc44d95277458c187c4f_belgium-national-team-footballlogos-org.png"
  ["BRA"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a07dd70012891100817_68f9fc74eac3dc471d42c1f1_brazil-national-team-footballlogos-org.png"
  ["CPV"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a04f8e4dbd2d7560e3f_68fd1a7a7cceddc21192dd2a_cabo-verde-footballlogos-org.png"
  ["CAN"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a09ff1d0f7cf9fc6892_68f9fcae7c3a768d2112f7cc_canada-national-team-footballlogos-org.png"
  ["CIV"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a0a63e7e11f6ecf95f4_68f9fe0f5e31af81b7ceb973_cote-d-ivoire-national-team-footballlogos-org.png"
  ["CUW"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a0c450ecf35a44ec35a_690b58788ae9e26e532abfdf_curacao-national-team-footballlogos-org.png"
  ["CZE"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a124f9b12d3899cdf35_68f9fefa92aa92766cfafa43_czechia-national-team-footballlogos-org.png"
  ["ECU"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a03e8cfc8f978c35242_68f9ffb9e5f5a02e2ddd6c89_ecuador-national-team-footballlogos-org.png"
  ["EGY"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b39fd094c95a818967d17_68f9ffff9f0a363d783fca07_egypt-national-team-footballlogos-org.png"
  ["ENG"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b39f4f81c2d9713bb1958_68fa004f9bad274585f92fd4_england-national-team-footballlogos-org.png"
  ["FRA"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b39fa921e692c7885a3a5_68fa00af9b52a99bf3ce88b8_france-national-team-footballlogos-org.png"
  ["GER"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a134ff2b16d2ff2c420_68fa00ee54de0cacbdff9b16_germany-national-team-footballlogos-org.png"
  ["GHA"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a176f4197f7299d29c76a61_6a121b9d1a9da04ec878bb21_ghana-national-team-footylogos.png"
  ["HAI"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0f4c6c910c48d9bace182a_692869cd3f30b984d69b7f75_haiti-national-team-footylogos.png"
  ["IRN"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b39f9be2380ec23ca8496_68fa01dc9c4cd3255b45967d_iran-national-team-footballlogos-org.png"
  ["IRQ"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a08c18986f46d9cbb5a_68fd1ce7c48c6f7c6b9f2d9f_iraq-footballlogos-org.png"
  ["JPN"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a179bc2e28bf73ecd09_68fa02b609c96c8ed3c2cdf6_japan-national-team-footballlogos-org.png"
  ["JOR"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b39fac9c45208a31ce544_68fd1d515ce3de4f3d2e23b0_jordan-footballlogos-org.png"
  ["MEX"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a067e47ced126acdd02_68fa02ee37f495f860481404_mexico-national-team-footballlogos-org.png"
  ["MAR"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b39f3ff709486e36ba903_68fa032284d7ebc8adde9b0e_morocco-national-team-footballlogos-org.png"
  ["NED"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a15786b121c0b7b60cc_68f9ff890403a59958f26579_netherlands-dutch-national-team-footballlogos-org.png"
  ["NZL"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b39ff967f6d274aeb4e8b_68fa67ce6d8bf137ee675702_new-zealand-national-team-footballlogos-org.png"
  ["PAR"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a15c8ff2f7f7f02602c_68fa042c2750779cccf807b4_paraguay-national-team-footballlogos-org.png"
  ["POR"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a0095b66650d7655aba_68fa6b30ffde0dbd282357ab_portugal-national-team-footballlogos-org.png"
  ["KSA"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b39f8751bc84c4be421cf_68fd1fc871c2e4977d6345f9_saudi-arabia-national-team-footballlogos-org.png"
  ["SCO"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a0e29b605309fb7f47b_68fa07134a7663c774887b1a_scotland-national-team-footballlogos-org.png"
  ["SEN"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a052fcac044e973b7e1_68fa07554408d744a38f143f_senegal-national-team-footballlogos-org.png"
  ["RSA"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b39f717d2d9b8868d47d7_68fd1ff449702964723a7890_south-africa-national-team-footballlogos-org.png"
  ["KOR"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a18adae7bad8cb6e423_68fa0855071867dd20c531f3_south-korea-national-team-footballlogos-org.png"
  ["ESP"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a1aa6db0dbe288b67f3_68fa08931b5e1697f8930e74_spain-national-team-footballlogos-org.png"
  ["SWE"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b39f2940ca8a6d33ef41f_68fa08ce61f58c56e735629c_sweden-national-team-footballlogos-org.png"
  ["SUI"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a0d052b7e092df739cf_68fa0904f28db91037150be9_swiss-national-team-footballlogos-org.png"
  ["TUN"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b39fc9b5ae9ed29ad6646_68fa093b578f3b5329f80833_tunisia-national-team-footballlogos-org.png"
  ["TUR"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a199844733813bb5b41_68fa09923df7f921ed9a86ef_turkey-national-team-footballlogos-org.png"
  ["URU"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b3a06d17821a2db9019ea_68fa0a1577c6612bb1154a07_uruguay-national-team-footballlogos-org.png"
  ["USA"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b39f54269adc0c7a000c3_68fa0a65e8dbfe6ba33cb5e6_usa-national-team-footballlogos-org.png"
  ["UZB"]="https://cdn.prod.website-files.com/68f550992570ca0322737dc2/6a0b39fc12418491a747e862_68fd208e9bfd4ed3a9b30b6f_uzbekistan-national-team-footballlogos-org.png"
)

for TLA in "${!CRESTS[@]}"; do
  URL="${CRESTS[$TLA]}"
  EXT="${URL##*.}"
  OUTPUT="$CRESTS_DIR/$TLA.$EXT"
  
  if [ -f "$OUTPUT" ]; then
    echo "  Já existe: $TLA.$EXT"
  else
    echo "  Baixando: $TLA.$EXT"
    curl -sL "$URL" -o "$OUTPUT"
    if [ $? -eq 0 ]; then
      echo "    OK!"
    else
      echo "    ERRO ao baixar $TLA"
    fi
  fi
done

echo ""
echo "Download concluído! Verifique a pasta: $CRESTS_DIR"
echo ""
echo "Seleções baixadas:"
ls -la "$CRESTS_DIR"
