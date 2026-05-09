#!/bin/bash

# ================================================
# Script de Teste - Verificar correção do erro 500
# ================================================
# Uso: bash test-products.sh

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL base
BASE_URL="${BACKEND_URL:-http://localhost:3000}"

echo -e "${YELLOW}🔍 Testando endpoints de produtos...${NC}\n"

# Test 1: GET /products
echo -e "${YELLOW}1️⃣  Testando GET /products${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" "$BASE_URL/products")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Status 200 OK${NC}"
  # Verificar se retorna description
  if echo "$BODY" | grep -q "description"; then
    echo -e "${GREEN}✅ Campo 'description' encontrado${NC}"
  else
    echo -e "${RED}❌ Campo 'description' NÃO encontrado${NC}"
  fi
  echo -e "Produtos retornados: $(echo "$BODY" | grep -o '"id"' | wc -l)\n"
else
  echo -e "${RED}❌ Status $HTTP_CODE (esperado 200)${NC}\n"
fi

# Test 2: POST /products
echo -e "${YELLOW}2️⃣  Testando POST /products${NC}"
PAYLOAD='{
  "name": "Teste Pimenta",
  "category": "pimentas",
  "emoji": "🌶️",
  "description": "Pimenta de teste",
  "price": 9.99
}'

RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/products" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Status $HTTP_CODE (produto criado)${NC}"
  PRODUCT_ID=$(echo "$BODY" | grep -o '"id":[0-9]*' | head -1 | cut -d: -f2)
  if [ ! -z "$PRODUCT_ID" ]; then
    echo -e "${GREEN}✅ ID do produto: $PRODUCT_ID${NC}\n"
  fi
else
  echo -e "${RED}❌ Status $HTTP_CODE (esperado 201 ou 200)${NC}"
  echo -e "Erro: $BODY\n"
fi

# Test 3: PUT /products/{id}
if [ ! -z "$PRODUCT_ID" ]; then
  echo -e "${YELLOW}3️⃣  Testando PUT /products/$PRODUCT_ID${NC}"
  UPDATE_PAYLOAD='{
    "name": "Pimenta Atualizada",
    "category": "pimentas",
    "emoji": "🌶️",
    "description": "Descrição atualizada",
    "price": 12.99
  }'
  
  RESPONSE=$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/products/$PRODUCT_ID" \
    -H "Content-Type: application/json" \
    -d "$UPDATE_PAYLOAD")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Status 200 OK (produto atualizado)${NC}\n"
  else
    echo -e "${RED}❌ Status $HTTP_CODE (esperado 200)${NC}\n"
  fi
  
  # Test 4: DELETE /products/{id}
  echo -e "${YELLOW}4️⃣  Testando DELETE /products/$PRODUCT_ID${NC}"
  RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL/products/$PRODUCT_ID")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Status 200 OK (produto deletado)${NC}\n"
  else
    echo -e "${RED}❌ Status $HTTP_CODE (esperado 200)${NC}\n"
  fi
fi

echo -e "${GREEN}✅ Testes concluídos!${NC}"
