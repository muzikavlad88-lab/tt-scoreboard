'use server';

import { google } from 'googleapis';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function appendMatchToSheet(matchData: any) {
  try {
    // 1. ЗАПИС В GOOGLE ТАБЛИЦІ
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const ukraineTime = new Date().toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv' });

    const row = [
      ukraineTime,
      matchData.matchType,
      matchData.p1,
      matchData.p2,
      matchData.p3 || '',
      matchData.p4 || '',
      matchData.winner,
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'A:G', 
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [row],
      },
    });
    console.log('Дані успішно записано в Google Таблиці');

    // 2. ОНОВЛЕННЯ РЕЙТИНГУ ТА СТАТИСТИКИ В SUPABASE
    const { matchType, player1Id, player2Id, player3Id, player4Id, winnerTeam } = matchData;

    const { data: players } = await supabaseAdmin.from('profiles').select('*');
    if (!players) throw new Error('Не вдалося завантажити профілі гравців на сервері');

    const p1Obj = players.find(p => p.id === player1Id) || {};
    const p2Obj = players.find(p => p.id === player2Id) || {};
    const p3Obj = matchType === '2v2' ? (players.find(p => p.id === player3Id) || {}) : {};
    const p4Obj = matchType === '2v2' ? (players.find(p => p.id === player4Id) || {}) : {};

    const currentElo1 = Number(p1Obj.elo ?? 1000);
    const currentElo2 = Number(p2Obj.elo ?? 1000);
    const currentElo3 = matchType === '2v2' ? Number(p3Obj.elo ?? 1000) : 1000;
    const currentElo4 = matchType === '2v2' ? Number(p4Obj.elo ?? 1000) : 1000;

    // ЗАХИСТ ВІД NULL: якщо в якійсь клітинці порожньо, примусово беремо нуль
    const wins1 = p1Obj.wins ? Number(p1Obj.wins) : 0;
    const losses1 = p1Obj.losses ? Number(p1Obj.losses) : 0;
    const wins2 = p2Obj.wins ? Number(p2Obj.wins) : 0;
    const losses2 = p2Obj.losses ? Number(p2Obj.losses) : 0;
    
    const wins3 = (matchType === '2v2' && p3Obj.wins) ? Number(p3Obj.wins) : 0;
    const losses3 = (matchType === '2v2' && p3Obj.losses) ? Number(p3Obj.losses) : 0;
    const wins4 = (matchType === '2v2' && p4Obj.wins) ? Number(p4Obj.wins) : 0;
    const losses4 = (matchType === '2v2' && p4Obj.losses) ? Number(p4Obj.losses) : 0;

    let side1Rating = matchType === '1v1' ? currentElo1 : (currentElo1 + currentElo3) / 2;
    let side2Rating = matchType === '1v1' ? currentElo2 : (currentElo2 + currentElo4) / 2;

    const ratingDiff = Math.abs(side1Rating - side2Rating);
    const isSide1Stronger = side1Rating > side2Rating;

    let team1WinGain = matchType === '1v1' ? 20 : 25;
    let team2WinGain = matchType === '1v1' ? 20 : 25;

    if (ratingDiff >= 200) {
      if (isSide1Stronger) { team1WinGain = 10; team2WinGain = 30; } 
      else { team1WinGain = 30; team2WinGain = 10; }
    }

    if (matchType === '1v1') {
      if (winnerTeam === 'team1') {
        const penalty = ratingDiff >= 200 && isSide1Stronger ? 30 : team1WinGain;
        await supabaseAdmin.from('profiles').update({ elo: currentElo1 + team1WinGain, wins: wins1 + 1 }).eq('id', player1Id);
        await supabaseAdmin.from('profiles').update({ elo: currentElo2 - penalty, losses: losses2 + 1 }).eq('id', player2Id);
      } else {
        const penalty = ratingDiff >= 200 && !isSide1Stronger ? 30 : team2WinGain;
        await supabaseAdmin.from('profiles').update({ elo: currentElo2 + team2WinGain, wins: wins2 + 1 }).eq('id', player2Id);
        await supabaseAdmin.from('profiles').update({ elo: currentElo1 - penalty, losses: losses1 + 1 }).eq('id', player1Id);
      }
    } else {
      if (winnerTeam === 'team1') {
        const penalty = ratingDiff >= 200 && isSide1Stronger ? 30 : team1WinGain;
        await supabaseAdmin.from('profiles').update({ elo: currentElo1 + team1WinGain, wins: wins1 + 1 }).eq('id', player1Id);
        await supabaseAdmin.from('profiles').update({ elo: currentElo3 + team1WinGain, wins: wins3 + 1 }).eq('id', player3Id);
        await supabaseAdmin.from('profiles').update({ elo: currentElo2 - penalty, losses: losses2 + 1 }).eq('id', player2Id);
        await supabaseAdmin.from('profiles').update({ elo: currentElo4 - penalty, losses: losses4 + 1 }).eq('id', player4Id);
      } else {
        const penalty = ratingDiff >= 200 && !isSide1Stronger ? 30 : team2WinGain;
        await supabaseAdmin.from('profiles').update({ elo: currentElo2 + team2WinGain, wins: wins2 + 1 }).eq('id', player2Id);
        await supabaseAdmin.from('profiles').update({ elo: currentElo4 + team2WinGain, wins: wins4 + 1 }).eq('id', player4Id);
        await supabaseAdmin.from('profiles').update({ elo: currentElo1 - penalty, losses: losses1 + 1 }).eq('id', player1Id);
        await supabaseAdmin.from('profiles').update({ elo: currentElo3 - penalty, losses: losses3 + 1 }).eq('id', player3Id);
      }
    }
    console.log('Рейтинги, перемоги та поразки успішно оновлено в profiles');

    // 3. ЗАПИС В ІСТОРІЮ CHALLENGES
    const matchPayload = {
      challenger_id: player1Id,
      challenger2_id: matchType === '2v2' ? player3Id : null, 
      defender_id: player2Id,
      defender2_id: matchType === '2v2' ? player4Id : null,   
      status: 'completed',
      score1: winnerTeam === 'team1' ? 11 : 0, 
      score2: winnerTeam === 'team2' ? 11 : 0
    };
    
    await supabaseAdmin.from('challenges').insert(matchPayload);
    return { success: true };
  } catch (error: any) {
    console.error('Помилка виконання Server Action:', error);
    return { success: false, error: error.message };
  }
}