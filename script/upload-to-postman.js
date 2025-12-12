import fs from 'fs';
import axios from 'axios';

const POSTMAN_API_KEY = process.env.POSTMAN_API_KEY;
const COLLECTION_UID = process.env.COLLECTION_UID;

async function mergeAndUpdate() {
  const { data: oldData } = await axios.get(
    `https://api.getpostman.com/collections/${COLLECTION_UID}`,
    { headers: { 'X-Api-Key': POSTMAN_API_KEY } }
  );

  fs.writeFileSync('old-postman-collection.json', JSON.stringify(oldData.collection, null, 2));

  const newData = JSON.parse(fs.readFileSync('postman-collection.json', 'utf8'));
  const merged = smartMergeCollections(oldData.collection, newData);

  await axios.put(
    `https://api.getpostman.com/collections/${COLLECTION_UID}`,
    { collection: merged },
    { headers: { 'X-Api-Key': POSTMAN_API_KEY, 'Content-Type': 'application/json' } }
  );

}

function smartMergeCollections(oldColl, newColl) {
  return {
    ...oldColl,
    item: mergeItems(oldColl.item, newColl.item)
  };
}

function mergeItems(oldItems, newItems) {
  const map = new Map();
  oldItems.forEach(item => map.set(item.name, item));
  newItems.forEach(item => map.set(item.name, item));

  console.log(JSON.stringify(oldItems),'checking old items ');
  return Array.from(map.values());
}

mergeAndUpdate().catch(console.error);
