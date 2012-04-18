'''
Created on 2012-4-9

@author: xmxjq
'''
import sqlite3

import TraceNode
import hashlib

class Tracer(object):
    '''
        Tracer is the main part of the trace function.
        It has function to trace and save the whole route when a url is loaded by a browser.
        TODO: save the html and visualize the result
            mark the malicious node and nodes tree.
    '''
    def __init__(self):
        self.__traceNodesTable = {}
        self.__rootnode = None
        self.__databaseConn = sqlite3.connect("TraceData.db")
        self.__databaseCur = self.__databaseConn.cursor()
        create_table_stmt = '''
            CREATE TABLE IF NOT EXISTS tracer_node_table (
            roothash CHAR(32),
            hash CHAR(32) PRIMARY KEY,
            url TEXT UNIQUE,
            parenthash CHAR(32),
            layer INTEGER,
            alertFlag CHAR(1)
        );'''
        self.__databaseCur.execute(create_table_stmt)
        self.__databaseConn.commit()
        self.isinitialized = False
    
    def init_root(self, rooturl):
        self.__rootnode = TraceNode.TraceNode(rooturl, None)
        self.__roothash = hashlib.md5(rooturl).hexdigest()
        self.__traceNodesTable[self.__roothash] = self.__rootnode
        self.isinitialized = True        
    
    def addNewUrl(self, url, parenturl):
        if self.__traceNodesTable.has_key(hashlib.md5(parenturl).hexdigest()):
            parentNode = self.__traceNodesTable[hashlib.md5(parenturl).hexdigest()]
            if not self.__traceNodesTable.has_key(hashlib.md5(url).hexdigest()):
                newNode = TraceNode.TraceNode(url, parentNode)
                parentNode.addChildNode(newNode)
                self.__traceNodesTable[hashlib.md5(url).hexdigest()] = newNode
                
    def printTraceRoute(self):
        for k,v in self.__traceNodesTable.iteritems():
            print k
            v.printNodeInfo()
            
    def printAlertRoute(self):
        self.__rootnode.findAlertRoute()
            
    def AddNodeAlert(self, url):
        if self.__traceNodesTable.has_key(hashlib.md5(url).hexdigest()):
            node = self.__traceNodesTable[hashlib.md5(url).hexdigest()]
            node.alert = True
            
    def saveTraceRoute(self):
        for k,v in self.__traceNodesTable.iteritems():
            v.saveNode(self.__databaseConn, self.__roothash)
                        
        self.__databaseConn.commit()


tracer = Tracer()