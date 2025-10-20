import { Company } from '@/types/crm';
import { detectDuplicates } from '@/lib/duplicate-detection';

/**
 * Test suite pour la détection de doublons
 */
export const testDuplicateDetection = () => {
  console.log('🧪 Démarrage des tests de détection de doublons...\n');

  // Test 1: Noms similaires
  testSimilarNames();

  // Test 2: Emails identiques
  testIdenticalEmails();

  // Test 3: Téléphones similaires
  testSimilarPhones();

  // Test 4: Doublons exacts
  testExactDuplicates();

  // Test 5: Pas de doublons
  testNoDuplicates();

  console.log('\n✅ Tous les tests sont terminés!');
};

function testSimilarNames() {
  console.log('📝 Test 1: Détection par noms similaires');
  
  const companies: Company[] = [
    {
      id: '1',
      name: 'Acme Corporation',
      contact_name: 'John Doe',
      contact_email: 'john@acme.com',
      phone: '+33123456789',
      status: 'TO_CONTACT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Acme Corp',
      contact_name: 'Jane Smith',
      contact_email: 'jane@acme.com',
      phone: '+33123456790',
      status: 'CONTACTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const duplicates = detectDuplicates(companies);
  console.log(`  ✅ Trouvé: ${duplicates.length} groupe(s)`);
  if (duplicates.length > 0) {
    console.log(`  📊 Similarité: ${(duplicates[0].similarity * 100).toFixed(0)}%`);
    console.log(`  💬 Raison: ${duplicates[0].reason}\n`);
  }
}

function testIdenticalEmails() {
  console.log('📧 Test 2: Détection par emails identiques');
  
  const companies: Company[] = [
    {
      id: '1',
      name: 'Tech Startup Inc',
      contact_name: 'Alice Johnson',
      contact_email: 'contact@techstartup.com',
      phone: '+33111111111',
      status: 'TO_CONTACT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Technology Startup',
      contact_name: 'Bob Wilson',
      contact_email: 'contact@techstartup.com',
      phone: '+33222222222',
      status: 'IN_DISCUSSION',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const duplicates = detectDuplicates(companies);
  console.log(`  ✅ Trouvé: ${duplicates.length} groupe(s)`);
  if (duplicates.length > 0) {
    console.log(`  📊 Similarité: ${(duplicates[0].similarity * 100).toFixed(0)}%`);
    console.log(`  💬 Raison: ${duplicates[0].reason}\n`);
  }
}

function testSimilarPhones() {
  console.log('☎️  Test 3: Détection par téléphones similaires');
  
  const companies: Company[] = [
    {
      id: '1',
      name: 'Global Solutions',
      contact_name: 'Charlie Brown',
      contact_email: 'info@globalsolutions.com',
      phone: '+33 (0)1 23 45 67 89',
      status: 'TO_CONTACT',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Global Solutions Ltd',
      contact_name: 'Diana Prince',
      contact_email: 'contact@globalsolutions.com',
      phone: '+33123456789',
      status: 'FIRST_FOLLOWUP',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const duplicates = detectDuplicates(companies);
  console.log(`  ✅ Trouvé: ${duplicates.length} groupe(s)`);
  if (duplicates.length > 0) {
    console.log(`  📊 Similarité: ${(duplicates[0].similarity * 100).toFixed(0)}%`);
    console.log(`  💬 Raison: ${duplicates[0].reason}\n`);
  }
}

function testExactDuplicates() {
  console.log('🎯 Test 4: Détection de doublons exacts');
  
  const companies: Company[] = [
    {
      id: '1',
      name: 'Innovation Labs',
      contact_name: 'Edward Norton',
      contact_email: 'contact@innovationlabs.com',
      phone: '+33333333333',
      status: 'COMING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Innovation Labs',
      contact_name: 'Edward Norton',
      contact_email: 'contact@innovationlabs.com',
      phone: '+33333333333',
      status: 'COMING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const duplicates = detectDuplicates(companies);
  console.log(`  ✅ Trouvé: ${duplicates.length} groupe(s)`);
  if (duplicates.length > 0) {
    console.log(`  📊 Similarité: ${(duplicates[0].similarity * 100).toFixed(0)}%`);
    console.log(`  💬 Raison: ${duplicates[0].reason}\n`);
  }
}

function testNoDuplicates() {
  console.log('✨ Test 5: Pas de doublons');
  
  const companies: Company[] = [
    {
      id: '1',
      name: 'Company One',
      contact_name: 'Frank Miller',
      contact_email: 'frank@companyone.com',
      phone: '+33444444444',
      status: 'NOT_COMING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Completely Different Company',
      contact_name: 'Grace Hopper',
      contact_email: 'grace@different.com',
      phone: '+33555555555',
      status: 'NEXT_YEAR',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const duplicates = detectDuplicates(companies);
  console.log(`  ✅ Trouvé: ${duplicates.length} groupe(s) (attendu: 0)`);
  if (duplicates.length === 0) {
    console.log('  ✨ Aucun doublon détecté (correct)\n');
  } else {
    console.log('  ⚠️  Des doublons ont été trouvés par erreur\n');
  }
}

// Exécuter les tests
if (typeof window !== 'undefined' && (window as any).__DEV__) {
  testDuplicateDetection();
}
