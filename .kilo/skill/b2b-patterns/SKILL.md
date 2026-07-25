---
name: b2b-patterns
description: "B2B e-commerce паттерны: каталог с фильтрацией, запрос КП, личный кабинет, интеграция с CRM"
---

# B2B Industrial E-commerce Patterns

## Модель продаж: RFQ (Request for Quote) + гибридная корзина

### Почему RFQ, а не «Купить сейчас»
- B2B-клиент редко покупает одну позицию — обычно 5-20 позиций в спецификации
- Цена зависит от объёма (скидка), региона доставки, срочности
- Многие позиции под заказ → срок уточняется
- Клиенту нужен счёт с НДС и договор, а не онлайн-чек

### Паттерн «RFQ Basket»
1. Клиент добавляет товары в «корзину заявки»
2. Указывает количество по каждой позиции
3. Нажимает «Запросить КП»
4. Заполняет: название компании, ИНН, контакт, email
5. Система создаёт лид в CRM (Битрикс24) и отправляет уведомление менеджеру
6. Менеджер готовит КП → высылает на email

## Компоненты

### 1. Search Bar (приоритетный элемент)
```
┌──────────────────────────────────────────────────────┐
│ 🔍  [HG25 или FSI32-10 или TR20x4R...   ]  [Найти]  │
│                                                      │
│  ┌—————————————————————————————————————————————┐     │
│  │ 🔍 HG25  → Направляющие HIWIN HG25      12 шт │     │  ← autocomplete
│  │ 🔍 HG25  → Каретки для HG25               8 шт │     │
│  │ 🔍 HG25R → Рельс HIWIN HG25R            в нал.│     │
│  └—————————————————————————————————————————————┘     │
└──────────────────────────────────────────────────────┘
```

### 2. Parametric Filter Panel
```tsx
// Категория: Направляющие
<FilterPanel>
  <FilterGroup name="Серия">
    <Checkbox label="HG (супер-грузоподъемные)" />
    <Checkbox label="EG (экономичные)" />
    <Checkbox label="RG (роликовые)" />
    <Checkbox label="MG (миниатюрные, нерж.)" />
    <Checkbox label="QH (с сепаратором SynchMotion)" />
  </FilterGroup>
  <FilterGroup name="Размер рельса, мм">
    <RangeSlider min={15} max={65} step={5} />
  </FilterGroup>
  <FilterGroup name="Класс точности">
    <Checkbox label="N (нормальный)" />
    <Checkbox label="H (высокий)" />
    <Checkbox label="P (прецизионный)" />
  </FilterGroup>
</FilterPanel>
```

### 3. MegaMenu
```tsx
// Desktop mega-menu: 3 columns
<MegaMenu>
  <MenuColumn title="Механика HIWIN">
    <MenuItem href="/naznachenie">Направляющие</MenuItem>
    <MenuItem href="/shvp">ШВП</MenuItem>
    <MenuItem href="/actuators">Актуаторы</MenuItem>
    <MenuItem href="/modules">Линейные модули</MenuItem>
  </MenuColumn>
  <MenuColumn title="Привод и автоматика">
    <MenuItem href="/servo">Сервопривод</MenuItem>
    <MenuItem href="/stepper">Шаговый привод</MenuItem>
  </MenuColumn>
  <MenuPromo>
    <Image src="/banner-rosca.jpg" />
    <Button href="/production">Производство Rosca →</Button>
  </MenuPromo>
</MegaMenu>
```

### 4. Product Card
```tsx
// Минимальная карточка товара
<ProductCard>
  <Image src={product.image} alt={product.name} />
  <Badge stock={product.stock}>В наличии: {product.stock} шт</Badge>
  <Title>{product.series} — {product.name}</Title>
  <Specs>
    <Spec label="Диаметр">{product.diameter} мм</Spec>
    <Spec label="Грузоподъемность">{product.load} кН</Spec>
  </Specs>
  <Price>{product.price} ₽</Price>
  <Actions>
    <Button variant="primary" onClick={addToBasket}>В корзину</Button>
    <Button variant="outline" onClick={addToCompare}>Сравнить</Button>
  </Actions>
</ProductCard>
```

### 5. RFQ Form
```tsx
// Компонент формы запроса КП
<RFQForm>
  <ContactFields>
    <Input name="company" label="Название компании" required />
    <Input name="inn" label="ИНН" />
    <Input name="name" label="Контактное лицо" required />
    <Input name="phone" label="Телефон" required />
    <Input name="email" label="Email" type="email" />
  </ContactFields>
  <ItemsTable>
    {/* Строки корзины */}
    <ItemRow>
      <span>HIWIN HG25R-1000</span>
      <QuantityInput value={2} />
      <span>25 000 ₽</span>
    </ItemRow>
  </ItemsTable>
  <FileUpload label="Приложить спецификацию (Excel/PDF)" />
  <Button type="submit">Отправить заявку</Button>
  <Consent>Нажимая кнопку, я даю согласие на обработку персональных данных</Consent>
</RFQForm>
```

## Интеграция с Битрикс24

```tsx
// lib/bitrix24.ts
export async function createLead(data: RFQData) {
  const response = await fetch(`${BITRIX24_WEBHOOK}/crm.lead.add`, {
    method: 'POST',
    body: JSON.stringify({
      fields: {
        TITLE: `Заявка от ${data.company}`,
        NAME: data.contactName,
        PHONE: [{ VALUE: data.phone, VALUE_TYPE: 'WORK' }],
        EMAIL: [{ VALUE: data.email, VALUE_TYPE: 'WORK' }],
        COMMENTS: formatBasketItems(data.items),
        SOURCE_ID: 'WEB',
        UF_CRM_XXXX: data.inn,
      }
    })
  });
  return response.json();
}
```

## URL-структура (SEO-friendly)

```
/catalog/                                       # каталог (индекс)
/catalog/naznachenie                            # направляющие HIWIN
/catalog/naznachenie/hg                         # серия HG
/catalog/naznachenie/hg/hg25r-1000              # конкретная позиция
/catalog/shvp                                   # ШВП HIWIN
/catalog/shvp/fsi
/catalog/shvp/fsi/fsi32-10
/production/screws                              # винты Rosca
/production/screws/tr20x4r                      # конкретный винт
```

## Состояния загрузки

- **Skeleton loaders** — анимированные плейсхолдеры вместо текста во время загрузки
- **Suspense** — React-компонент для асинхронной загрузки частей страницы
- **Empty state** — дружелюбное сообщение «Ничего не найдено» с подсказками
- **Error state** — «Что-то пошло не так» + кнопка «Попробовать снова»
