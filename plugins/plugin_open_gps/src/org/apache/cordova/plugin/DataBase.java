package org.apache.cordova.plugin;

import static android.provider.BaseColumns._ID;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.SQLException;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import android.util.Log;

public class DataBase extends SQLiteOpenHelper {

	protected String dataBaseName = "DATABASE";

	public DataBase(Context context, String dataBaseName, int version) {
		super(context, dataBaseName, null, version);
		this.dataBaseName = dataBaseName;
	}

	@Override
	public void onCreate(SQLiteDatabase sqLiteDatabase) {
		try {
			
		} catch (Exception e) {
			Log.i(dataBaseName, "Error al abrir o crear la base de datos", e);
		}
	}

	@Override
	public void onUpgrade(SQLiteDatabase sqLiteDatabase, int oldVersion,
			int newVersion) {

	}

	public String getDataBaseName() {
		return dataBaseName;
	}

	public boolean insert(SQLiteDatabase sqLiteDatabase, String table,
			ContentValues tableValues) {
		try {
			sqLiteDatabase.insert(table, null, tableValues);
		} catch (Exception e) {
			Log.i(dataBaseName, "Error al insertar Registro en:" + table, e);
			return false;
		}
		return true;
	}

	public boolean insert(String table, ContentValues tableValues) {
		SQLiteDatabase sqLiteDatabase = null;
		try {
			sqLiteDatabase = getWritableDatabase();
			insert(sqLiteDatabase, table, tableValues);
		} catch (Exception e) {
			Log.i(dataBaseName, "Error al insertar Registro en:" + table, e);
			return false;
		} finally {
			__close(sqLiteDatabase);
		}
		return true;
	}

	public int update(SQLiteDatabase sqLiteDatabase, String table,
			ContentValues tableValues, String whereClause, String[] whereArgs) {
		try {
			return sqLiteDatabase.update(table, tableValues, whereClause,
					whereArgs);
		} catch (Exception e) {
			Log.i(dataBaseName, "Error al actualizar Registro en:" + table, e);
		}
		return 0;
	}

	public int update(String table, ContentValues tableValues,
			String whereClause, String[] whereArgs) {
		SQLiteDatabase sqLiteDatabase = null;
		int rows = 0;
		try {
			sqLiteDatabase = getWritableDatabase();
			rows = update(sqLiteDatabase, table, tableValues, whereClause,
					whereArgs);
		} catch (Exception e) {
			Log.i(dataBaseName, "Error al actualizar Registro en:" + table, e);
		} finally {
			__close(sqLiteDatabase);
		}
		return rows;
	}

	public boolean delete(SQLiteDatabase sqLiteDatabase, String table,
			String whereClause, String[] whereArgs) {
		try {
			sqLiteDatabase.delete(table, whereClause, whereArgs);
			return true;
		} catch (Exception e) {
			Log.i(dataBaseName, "Error al eliminar Registro en:" + table, e);

		}
		return false;
	}

	public boolean delete(String table, String whereClause, String[] whereArgs) {
		SQLiteDatabase sqLiteDatabase = null;
		boolean deleted = false;
		try {
			sqLiteDatabase = getWritableDatabase();
			deleted = delete(sqLiteDatabase, table, whereClause, whereArgs);
		} catch (Exception e) {
			Log.i(dataBaseName, "Error al eliminar Registro en:" + table, e);
		} finally {
			__close(sqLiteDatabase);
		}
		return deleted;
	}

	public boolean next(Cursor cr) {
		try {
			if (cr.isLast()) {
				cr.moveToFirst();
				return true;
			}
			cr.moveToNext();
			return true;
		} catch (Throwable e) {
			Log.i(dataBaseName, "Error al leer el cursor", e);
		}
		return false;
	}

	public boolean last(Cursor cr) {
		try {
			cr.moveToLast();
			return true;
		} catch (Throwable e) {
			Log.i(dataBaseName, "Error al leer el cursor", e);
		}
		return false;
	}

	public boolean first(Cursor cr) {
		try {
			cr.moveToFirst();
			return true;
		} catch (Throwable e) {
			Log.i(dataBaseName, "Error al leer el cursor", e);
		}
		return false;
	}

	public boolean previous(Cursor cr) {
		try {
			if (cr.isFirst()) {
				cr.moveToLast();
				return true;
			}
			cr.moveToPrevious();
			return true;
		} catch (Throwable e) {
			Log.i(dataBaseName, "Error al leer el cursor", e);
		}
		return false;
	}

	public static String getCreateQuery(String table,
			HashMap<String, String> columns) {

		String query = "create table if not exists " + table + "" + "(" + _ID
				+ " INTEGER PRIMARY KEY AUTOINCREMENT";
		Iterator<String> iterator = columns.keySet().iterator();
		while (iterator.hasNext()) {
			String column = (String) iterator.next();
			if (column != _ID) {
				query = query + "," + column + " " + columns.get(column);
			}
		}
		System.out.println(query);
		return query + ");";
	}

	public static String[] getColumnNames(HashMap<String, String> columns) {
		String[] columnNames = new String[columns.size()];
		columnNames[0] = _ID;
		int index = 1;
		Iterator<String> iterator = columns.keySet().iterator();
		while (iterator.hasNext()) {
			String column = (String) iterator.next();
			if (column != _ID) {
				columnNames[index] = column;
				index++;
			}
		}
		return columnNames;
	}

	public boolean __close(SQLiteDatabase sqLiteDatabase) {
		try {
			if (sqLiteDatabase != null) {
				sqLiteDatabase.close();
			}
		} catch (Exception e) {
			return false;
		}
		return true;
	}
}
